import React from 'react';

import Mstyle from '../../model/Mstyle';
import Vfield from '../Vfield';

export default class Vsources extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.handle = {
			change(code){
				Mstyle.update(code);
			}
		};
		for (let i in this.handle){
			this.handle[i] = this.handle[i].bind(this);
		}
	}

	render (){
		const {style, match, handle} = this.props;

		const errors = Mstyle.errorsGet();

		console.log('code render errs:',errors);

		const field = {
			value:Mstyle.getMapStyle(),
			error:errors,
			type:'JSON'
		};

		return <div className="row h-100 mr-0">
			<div className="col-sm-12">
				<Vfield field={field} handle={this.handle}/>
			</div>
		</div>
	}
};