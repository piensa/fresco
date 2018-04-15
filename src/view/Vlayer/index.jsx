import React from 'react';
import {NavLink, Link, Route, Switch} from 'react-router-dom';

import LayerIcon from '../../utility/LayerIcon';

import Mstyle from '../../model/Mstyle';

import VlayerAdd from './VlayerAdd';
import VlayerEdit from './VlayerEdit';

export default class Vlayers extends React.Component {
	constructor (props){
		super(props);
		const {handle, match, style} = this.props;

		this.state = {
			layerAddShown:false
		};

		console.log('match:',match);

		if (style.has('layers') && style.get('layers').size > 0 && match.isExact){
			handle.routeReplace('layer/'+encodeURIComponent(style.getIn(['layers',0,
				'id'])));
		}

		this.handle = {
			layerAdd:()=>{
				handle.route('layerAdd');
			}
		};
		for (let i in this.handle){
			this.handle[i] = this.handle[i].bind(this);
		}
	}

	componentWillReceiveProps (nextProps){
		const {handle, match, style} = nextProps;
		if (style.has('layers') && style.get('layers').size > 0 && match.isExact){
			handle.routeReplace('layer/'+encodeURIComponent(style.getIn(['layers',0,
				'id'])));
		}
	}

	render (){
		const {style, match, handle} = this.props;

		if (!style.has('layers') || style.get('layers').size < 1){
			return <VlayerAdd handle={handle} style={style}/>;
		}

		const layers = style.get('layers');
		const errors = Mstyle.errorsGet();
		
		return <div className="row mr-0 h-100">
			<div className="col-sm-5 pr-0">
				<div className="pl-1 py-1">
					<h2 className="px-2 py-1 m-0 text-nav bg-light list-border-right">
						Layers ({layers.size})
						<div className="float-right">
							<Link className="icon-btn gray" to={`${match.url}/search`}>
								<i className="material-icons md-18">search</i>
							</Link>
							<Link className="ml-1 icon-btn gray" to={`${match.url}/add`}>
								<i className="material-icons md-18">add_circle_outline</i>
							</Link>
						</div>
					</h2>
					<div className="bg-light">
						{layers !== undefined && layers.map((layer,i)=>{
							//console.log('layer:',layer);

							let className = 'px-2 py-1 d-block link-list list-border-right position-relative p-list';
							if (errors.hasIn(['layers',i])) className += ' error';

							return <NavLink to={`${match.url}/${layer.get('id')}`} 
								className={className} key={layer.get('id')}>

								<div className="list-left mr-2 inline-block">
									<i className="material-icons md-18" style={{color:LayerIcon.getColor(layer)}}>{LayerIcon.getIcon(layer)}</i>
								</div>
								{layer.get('id')}
								<div className="list-right ml-2">
									<i className="material-icons md-18">visibility</i>
								</div>
							</NavLink>
						})}
					</div>
				</div>
			</div>
			<div className="col-sm-7 px-0">
				<div className="p-1">
					<Switch>
						<Route path={`${match.url}/add`} 
							render={(props) => <VlayerAdd style={style} handle={handle} {...props}/>}/>
						<Route path={`${match.url}/:id`} 
							render={(props) => <VlayerEdit style={style} handle={handle} {...props}/>}/>
					</Switch>
				</div>
			</div>
		</div>
	}
};