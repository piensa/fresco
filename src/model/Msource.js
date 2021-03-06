import Store from '../Store';
import SourceReader from '../utility/SourceReader';
import MaterialColor from '../utility/MaterialColor';

import styleSpec from '../vendor/style-spec/style-spec';

import Mstyle from './Mstyle';

export default {

	add:function(source,key,makeLayers){
		return new Promise((resolve,reject)=>{
			if (!source.url) throw new Error('no source.url');
			if (!source.type) throw new Error('no source.type');

			if (source.url.indexOf('/localhost') !== -1){
				// check if user is also using localhost
				if (window.location.indexOf('/localhost') !== -1){
					return reject('not localhost');
				}
			}

			//set key on source
			key = key || source.url;

			SourceReader.load(source.url).then((sourceJson)=>{
				
				Store.dispatch({
					type:'SOURCE_ADD',
					payload:source,
					key:key
				});
				Store.dispatch({
					type:'STYLE_STORE_SETIN',
					key:['sourceJson',source.url],
					payload:sourceJson
				});

				if (makeLayers){
					const sourceLayers = sourceJson.vector_layers;
					this.setupInitialLayers(key, sourceLayers);
				}

				Mstyle.save();
				return resolve(source);
			}).catch((e)=>{
				return reject(e);
			});	
		});

	},

	getAllTypeOptions:function(){
		const spec = styleSpec.latest;
		let values = {};
		for (let i in spec){
			if (i.indexOf('source_') === 0){
				const type = i.replace('source_','').replace('_','-');
				if (spec[i].type && spec[i].type.values && spec[i].type.values[type])
					values[type] = {doc:spec[i].type.values[type].doc};
			}
		}
		return values;
	},

	remove:function(key){
		return new Promise((resolve,reject)=>{
			// remove all style layers associated with this source
			const layers = Mstyle.get().getIn(['rec','layers']);
			console.log('layers:',layers);
			layers.map((layer)=>{
				if (layer.get('source') === key){
					Store.dispatch({
						type:'LAYER_REMOVE',
						layerId:layer.get('id')
					});
				}
			});

			Mstyle.removeIn(['sources',key]).then(()=>{
				resolve();
			}).catch((e)=>{
				reject(e);
			});
		});
	},

	setJSON:function(key,source){
		//console.log('setJSON source:',source);
		return new Promise((resolve,reject)=>{
			SourceReader.load(source.get('url')).then((sourceJson)=>{
				Store.dispatch({
					type:'STYLE_STORE_SETIN',
					key:['sourceJson',key],
					payload:sourceJson
				});

				Mstyle.save();

				return resolve();
			}).catch((e)=>{
				return reject(e);
			});
		});
	},

	setupInitialLayers:function(key, sourceLayers){
		return new Promise((resolve,reject)=>{
			sourceLayers.map((sourceLayer)=>{
				const color = MaterialColor.getBright(sourceLayer.id);
				let layer = {
					id:sourceLayer.id,
					source:key,
					'source-layer':sourceLayer.name,
					layout: {
						visibility: 'visible'
					},
					'minzoom':sourceLayer.minzoom,
					'maxzoom':sourceLayer.maxzoom,
				};
				if (sourceLayer.geometry_type === 'point'){
					layer.type = 'circle';
					layer.paint = {
						'circle-radius': 3,
						'circle-color': color
					}
				} else if (sourceLayer.geometry_type === 'line'){
					layer.type = 'line';
					layer.paint = {
						'line-color': color
					}
				} else if (sourceLayer.geometry_type === 'polygon'){
					layer.type = 'fill';
					layer.paint = {
						'fill-color': color,
						'fill-opacity': 0.2
					}
				}
				if (!layer.type) return null;

				Store.dispatch({
					type:'LAYER_ADD',
					payload:layer
				});
				return null;
			});

			Mstyle.save();

			return resolve();
		});
	},
	get:function(key){
		if (key === undefined) return Store.getState().style.getIn(['rec','sources']);
		return Store.getState().style.getIn(['rec','sources',key]);
	},
	getOptions:function(){
		let options = [];
		const sources = this.get();

		//console.log('sources:',sources);
		sources.keySeq().toArray().forEach((key)=>{
			//console.log('sources key:',key);
			//const source = sources.get(key);
			options.push({
				name:key,
				value:key
			});
			return;
		});
		return options;
	},
	getLayerOptions:function(key){
		let options = [];
		const sourceLayers = this.getLayers(key);

		if (!sourceLayers) return null;

		//console.log('sources:',sources);
		sourceLayers.map((layer)=>{
			//console.log('source layer:',layer);
			//const source = sources.get(key);
			options.push({
				name:layer.get('name'),
				value:layer.get('name')
			});
			return;
		});
		return options;
	},
	getLayers:function(key){
		return Store.getState().style.getIn(['rec','_store','sourceJson',key,'vector_layers']);
	},
	getJson:function(key){
		return Store.getState().style.getIn(['rec','_store','sourceJson',key]);
	}

};