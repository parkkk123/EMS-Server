import React, { useState } from 'react'
import { Row, Col, Icon, Card, Button, Modal, message, Layout } from 'antd'
import MapGL, {Marker, NavigationControl, FullscreenControl} from 'react-map-gl'
import ScaleText from 'react-scale-text';
import axios from 'axios'
import MarkerPin from './map-pin'
import window from 'global'
import Router from 'next/router'
import LoadingScreen from './../src/components/loading_screen'

import HeaderImg from './../src/img/header_fr-2.png'

const apiCarUnAvailableURL = "https://tapi.cmugency.com/v1/others/EMSCar/1"
const apiCarAvailableURL = "https://tapi.cmugency.com/v1/others/EMSCar/0"
const apiRequestURL = "https://tapi.cmugency.com/v1/others/EMSReq"
const apiGetCarID = "https://tapi.cmugency.com/v1/ambulance/getCarID"

const TOKEN = 'pk.eyJ1IjoiY2FydG9vbjYwNiIsImEiOiJjanl4YTZnMG4wNTJ3M2dvMXhvOHUxcXFqIn0.CNIeeODia_LEgKFnnlkzkA'

const fullscreenControlStyle = {
	position: 'absolute',
	top: 0,
	left: 0,
	padding: '10px'
};

const navStyle = {
	position: 'absolute',
	top: 36,
	left: 0,
	padding: '10px'
};

class FRPage extends React.Component{

	constructor(props){
		super(props);

		this.state = {
			viewport: {
				width: '90vw',
				height: '55vh',
				latitude: 15.8700,
				longitude: 100.9925,
				zoom: 5
			},
			isMounted: false,
			ambuStatus: `ว่าง`,
			patLocation_lat: null,
			patLocation_lng: null,
			ambuLocation_lat: null,
			ambuLocation_lng: null,
			this_car_id: -1,
			prevState: `-`,
			datetime: null,
            inProcessFoundAmbulance: false,
            zoomInIdle: false,
			token: `null`,
			header_axios: {},
			loading: true,
			is_success_first_load_av_car: false,
			is_success_first_load_un_av_car: false,
			is_success_first_load_req: false,
        }

		this._initReset = () => {
			this.setState({
				viewport: {
					width: '90vw',
					height: '55vh',
					latitude: 15.8700,
					longitude: 100.9925,
					zoom: 5
				},
				ambuStatus: `ว่าง`,
				patLocation_lat: null,
				patLocation_lng: null,
				ambuLocation_lat: null,
				ambuLocation_lng: null,
				prevState: `-`,
				datetime: null,
				inProcessFoundAmbulance: false,
                zoomInIdle: false,
			})
		}

		// map render popup
		this._updateViewport = viewport => {
			this.setState({viewport});
		};

		this._updateSizeMap = () => {
			this.state.viewport.width = '90vw'
			this.state.viewport.height = '55vh'
		}

		// marker render
		this._renderMarkerUser = () => {
			//console.log(`render marker user`)
			if (this.state.patLocation_lat != null && this.state.patLocation_lng != null)
			{
                //console.log(`lat: ${this.state.patLocation_lat}, lng: ${this.state.patLocation_lng}`)
				return(
					// return current location
					<Marker key={`marker-user`} latitude={this.state.patLocation_lat} longitude={this.state.patLocation_lng}>
						<MarkerPin size={30} stat_pin={`req`} pin_id={1} pin_info={`ตำแหน่งผู้ใช้`} />
					</Marker>
				);
			}
		}

		this._renderMarkerAmbulance = () => {
			//console.log(`render marker ambulance`)
			if (this.state.ambuLocation_lat != null && this.state.ambuLocation_lng != null)
			{
				return(
					// return ambulance location
					<Marker key={`marker-ambu`} latitude={this.state.ambuLocation_lat} longitude={this.state.ambuLocation_lng}>
						<MarkerPin size={30} stat_pin={`u_car`} pin_id={2} pin_info={`ตำแหน่งรถพยาบาล`} />
					</Marker>
				);
			}
		}

		// get patient location and ambulance location
		this._checkStatusAndLocation = () => {
			this.state.inProcessFoundAmbulance = true
			console.log('start check status of this car')
			var found_car = false
			var found_req_loc = false
			axios.get(`${apiCarUnAvailableURL}`, {
				withCredentials: true,
				headers: this.state.header_axios 
			}, {timeout: 5000})
			  .then(res => {
				var json_data_lst = res.data.data
				var data_lst = []
				for (let j in json_data_lst){
					data_lst.push(json_data_lst[j])
				}
				for (let i = 0; i < data_lst.length; i++){
				  var row_dat = data_lst[i].trim().split("|")
				  var car_id = row_dat[0].trim().split(":")[1].trim()
				  if (car_id == this.state.this_car_id){
					console.log('found unavailable car that match with this device')
					found_car = true
					// get lat lng of ambu car
					var p_lat = parseFloat(row_dat[4].trim().split(":")[1].trim().split(",")[0])
					var p_lng = parseFloat(row_dat[4].trim().split(":")[1].trim().split(",")[1])
					this.state.ambuLocation_lat = p_lat
					this.state.ambuLocation_lng = p_lng
		
					// see req id position
					var req_id = row_dat[6].trim().split(":")[1].trim()
					axios.get(`${apiRequestURL}`, {
						withCredentials: true,
						headers: this.state.header_axios 
					}, {timeout: 5000})
					.then(res => {
						var json_data_lst = res.data.data
						var data_req_lst = []
						for (let j in json_data_lst){
							data_req_lst.push(json_data_lst[j])
						}
						for (let j = 0; j < data_req_lst.length; j++){
							var row_req_dat = data_req_lst[j].trim().split("|")
							var req_row_id = row_req_dat[0].split(":")[1].trim()
							if (req_row_id == req_id){
							// get location and break
							var pat_lat = parseFloat(row_req_dat[5].trim().split(":")[1].split(",")[0].trim())
							var pat_lng = parseFloat(row_req_dat[5].trim().split(":")[1].split(",")[1].trim())
							this.state.patLocation_lat = pat_lat
							this.state.patLocation_lng = pat_lng
							
							found_req_loc = true
							}
						}
						
						// show status of request
						if (found_req_loc == false){
							console.log(`req check status: don't found request`)
						}
						else{
							console.log(`req check status: found request`)
						}
		
						})
					.catch(err => {
						console.log(err)
					})
					if (found_req_loc == true){
					  break
					}
				}
			}
				
			// show status of ambulance
			if (found_car == false){
                // find car on available car for show location
                axios.get(`${apiCarAvailableURL}`, {
					withCredentials: true,
					headers: this.state.header_axios 
				}, {timeout: 5000})
                    .then(res => {
						var json_data_lst = res.data.data
						var data_lst = []
						for (let j in json_data_lst){
							data_lst.push(json_data_lst[j])
						}
                        for (let i = 0; i < data_lst.length; i++){
                            var row_dat = data_lst[i].trim().split("|")
                            var car_id = row_dat[0].trim().split(":")[1].trim()
                            if (car_id == this.state.this_car_id){
                                // get lat lng of ambu car
                                var p_lat = parseFloat(row_dat[4].trim().split(":")[1].trim().split(",")[0])
                                var p_lng = parseFloat(row_dat[4].trim().split(":")[1].trim().split(",")[1])
                                this.state.ambuLocation_lat = p_lat
                                this.state.ambuLocation_lng = p_lng
                                if (this.state.zoomInIdle == false){
                                    this._zoomWhenFound()
                                    this.state.zoomInIdle = true
                                }
                            }
                        }
                        
				        this.state.inProcessFoundAmbulance = false
                    })
                    .catch(err => {
                        console.log(err)
                        message.warning(`เกิดข้อผิดพลาด: ${err}`)
                        this.state.inProcessFoundAmbulance = false
                    })
                    
				this.state.ambuStatus = `ว่าง`
				console.log(`status : waiting`)
				if (this.state.prevState == `ต้องไปรับผู้ป่วย`)
				{
					this._initReset()
				}
                this.state.prevState = `ว่าง`

			}
			else {
				
				this.state.ambuStatus = `ต้องไปรับผู้ป่วย`
				console.log(`status : go on`)
				if (this.state.prevState == `ว่าง`){
					this._zoomWhenFound()
				}
				this.state.prevState = `ต้องไปรับผู้ป่วย`
				this.state.inProcessFoundAmbulance = false
			}
	
			})
				.catch(err => {
				console.log(err)
				this.state.inProcessFoundAmbulance = false
			})

		}

		// map reaction
		this._zoomWhenFound = () => {
			message.warning(`Zoom In To Ambulance Car`)
			this.setState({
				viewport: {
					width: '90vw',
                    height: '55vh',
                    latitude: this.state.ambuLocation_lat,
                    longitude: this.state.ambuLocation_lng,
                    zoom: 10
				}
			})
		}
			
		this._statusBox = () => {
			if (this.state.ambuStatus==`ต้องไปรับผู้ป่วย`)
			{
				return(
					<Layout 
						style={{
							height: '8vh', 
							width: '65vw', 
							backgroundColor:'white',
							borderRadius: '10px',
							boxShadow: '0px 0px 5px #888888',
							borderColor: '#A8A8A8',
							textAlign:'center',
							alignSelf:'center',
							paddingTop:'2.5vh',
							background: 'linear-gradient(270deg, rgba(227,176,75,1) 0%, rgba(241,214,171,1) 100%)',
						}}
					>
						<ScaleText minFontSize={10} maxFontSize={20}>
							{`สถานะ: ${this.state.ambuStatus}`}
						</ScaleText>
					</Layout>
				);
			}
			else
			{
				return(
					<Layout 
						style={{
							height: '8vh', 
							width: '65vw', 
							backgroundColor:'white',
							borderRadius: '10px',
							boxShadow: '0px 0px 5px #888888',
							borderColor: '#A8A8A8',
							textAlign:'center',
							alignSelf:'center',
							paddingTop:'2.5vh',
							background: 'linear-gradient(90deg, rgba(227,246,245,1) 0%, rgba(186,232,232,1) 100%)',
						}}
					>
						<ScaleText minFontSize={10} maxFontSize={20}>
							{`สถานะ: ${this.state.ambuStatus}`}
						</ScaleText>
					</Layout>
				);
			}
		}

        this._ChangeToLoginPage = () => {
            Router.push({
                pathname: '/index'
            })
		}
		
		this._check_first_load_api = () => {
			if (this.state.is_success_first_load_av_car == true &&
				this.state.is_success_first_load_un_av_car == true &&
				this.state.is_success_first_load_req == true){
					this.setState({
						loading: false,
					})
				}
		}

		this._renderLoadingScreen = () => {
			const {loading} = this.state
			//console.log(`ren load`)
			if (loading == true)
			{
				return (
					<LoadingScreen />
				)
			}
		}
		
	}

	render(){
		console.log(`---render---`)
		this._updateSizeMap()
        const { isMounted, loading } = this.state
        
		if(this.state.inProcessFoundAmbulance == false)
		{
			this._checkStatusAndLocation()
		}
		if (loading == true){
			return(
				<div style={{height:'100vh', width:'100vw'}}>	
					{this._renderLoadingScreen()}
				</div>
			)
		}
		return(
			<div style={{height:'100vh', width:'100vw'}}>	
				<img
					src={HeaderImg}
					alt=''
					width='100%'
					style={{zIndex:10}}
				/>
				<Layout
					style={{
						height:'100vh',
						width:'100vw',
						position:'absolute',
						zIndex:5,
						background:'rgba(146,226,232,1)'
					}}
				>
				</Layout>
				<Row style={{height:'2vh'}}></Row>
				<Row style={{height:'2vh'}}></Row>
				<Row type={"flex"} justify={"center"} align={"middle"} 
					style={{
						height:'10vh', 
						width:'100vw'
					}}>
					<Layout
						style={{
							height: '10vh',
							width: '70vw',
							backgroundColor:'transparent',
							zIndex:6
						}}
					>
						{this._statusBox()}
					</Layout>
				</Row>
				<Row style={{height:'2vh'}}></Row>
				<Row type={"flex"} justify={"center"} style={{height:'60vh'}}>
					<Layout
						style={{
							height: '60vh',
							width: '100vw',
							alignItems: 'center',
							justifySelf: 'center',
							backgroundColor:'transparent'
						}}
					>
						<Layout 
							style={{
								height: '60vh', 
								width: '95vw', 
								backgroundColor:'white',
								borderRadius: '10px',
								boxShadow: '0px 0px 5px #888888',
								borderColor: '#A8A8A8',
								alignItems: 'center',
								justifySelf: 'center',
								verticalAlign: 'middle',
								padding:'1vh 1vw 1vh 1vw',
								zIndex:6,
							}}
						>
							<link href="https://api.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.css" rel="stylesheet" />
							<MapGL
								mapStyle="mapbox://styles/mapbox/streets-v9"
								mapboxApiAccessToken={TOKEN}
								{...this.state.viewport}
								onViewportChange={(viewport) => {
									if (isMounted) { this.setState({ viewport })}
								}}
							>
								
								{this._renderMarkerUser()}
								{this._renderMarkerAmbulance()}
								
								<div className="fullscreen" style={fullscreenControlStyle}>
									<FullscreenControl />
								</div>
								<div className="nav" style={navStyle}>
									<NavigationControl />
								</div>
							</MapGL>
						</Layout>
					</Layout>
				</Row>
			</div>
		)
	}

	componentDidMount() {
		// receive token from login page
        const data = localStorage.getItem('_token')
        if (data){ 
			this.state.token = JSON.parse(data)
			//console.log(`Bearer ${this.state.token}`)
			// test get me
			const header = {
				'Content-Type': 'application/json',
				"Accept": "application/json",
				'Authorization': `Bearer ${this.state.token}`
			}
			axios.get(apiGetCarID, {
				withCredentials: true,
				headers: header 
			})       
			.then(res => {
				if (res.data.status == true)
				{
					//console.log(res)
					this.state.header_axios = header
					this.state.this_car_id = res.data.data["id"]
					// mount and start app
					if (this.state.interval == null){
						this.state.interval = setInterval(() => this.setState({datetime: Date.now()}), 5000)
					}

					this.setState({ isMounted: true, loading: false })
				}
				else{
					console.log(`app not ready to start`)
					// back login
					this._ChangeToLoginPage()
				}
			})
			.catch(err => {
                console.log(err)
                // back login
                this._ChangeToLoginPage()
			})
		}
		else {
            console.log(`token : disappear`)
            // back login
            this._ChangeToLoginPage()
		}
        
		console.log('did mound ...')
	}
	
	componentWillUnmount() {
		clearInterval(this.state.interval)
	}

    componentWillMount() {
    }
}

export default FRPage