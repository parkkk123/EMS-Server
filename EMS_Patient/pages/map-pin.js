import React, {PureComponent} from 'react';
import { message } from 'antd'
import GPLusPin from './../src/img/plus_g.png';
import RPlusPin from './../src/img/plus_r.png';
import BlackPlusPin from './../src/img/plus_black.png'
import RPin from './../src/img/pr_new.png';
import BPin from './../src/img/pr_new_blue.png';

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
C20.1,15.8,20.2,15.8,20.2,15.7z`;

export default class CityPin extends PureComponent {
    render() {

        const {size = 20, stat_pin, pin_id, pin_info} = this.props;
        var pin_str = `${pin_id}, ${pin_info}`

		const _mapPinClick = () => {
			message.warning(`pin: ${pin_str}`);
        }
        
        if (stat_pin == "a_car") // available car
        {
            return (
                <img 
                    src={GPLusPin} 
                    alt='' 
                    height={size}
                    style={{
                        transform: `translate(${-size/2}px, ${-size}px)`
                    }}
                    onClick={() => _mapPinClick()}
                />
            );
        }
        else if (stat_pin == "u_car"){ // un-available car
            return (
                <img 
                    src={RPlusPin} 
                    alt='' 
                    height={size}
                    style={{
                        transform: `translate(${-size/2}px, ${-size}px)`
                    }}
                    onClick={() => _mapPinClick()}
                />
            );
        }
        else if (stat_pin == "accept_req"){ // accepted request
            return(
                <img 
                    src={BPin} 
                    alt='' 
                    height={size}
                    style={{
                        transform: `translate(${-size/2}px, ${-size}px)`
                    }}
                    onClick={() => _mapPinClick()}
                />
            )
        }
        else if (stat_pin == "sleep_car"){ // for car that is sleeping
            return (
                <img 
                    src={BlackPlusPin} 
                    alt='' 
                    height={size}
                    style={{
                        transform: `translate(${-size/2}px, ${-size}px)`
                    }}
                    onClick={() => _mapPinClick()}
                />
            );
        }
        else{ // req
            return (
                <img 
                    src={RPin} 
                    alt='' 
                    height={size}
                    style={{
                        transform: `translate(${-size/2}px, ${-size}px)`
                    }}
                    onClick={() => _mapPinClick()}
                />
            );
        }
    }
}