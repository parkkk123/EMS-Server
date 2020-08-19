import React from 'react'
import { Row, Col, Icon, Card, Button, Modal, message, Layout } from 'antd'
import MapGL, {Marker, NavigationControl, FullscreenControl} from 'react-map-gl'
import ScaleText from 'react-scale-text';
import axios from 'axios'
import MarkerPin from './map-pin'

import CardInfo from './../src/components/index_page/card_info'
import LoadingScreen from './../src/components/loading_screen'
import HeaderImg from './../src/img/header_patient-2.png'

// nodejs api
const apiSendReq = 'http://10.10.182.225:8081/v1/others/EMSMobileReq'
const apiGetReqStatus = 'http://10.10.182.225:8081/v1/patient/EMSReqMobile'
const apiSendCancelReq = 'http://10.10.182.225:8081/v1/patient/EMSCancelReq'
const apiFreeCar = 'http://10.10.182.225:8081/v1/patient/EMSFreeCar'
// for auto authen
const apiLoginURL = "http://10.10.182.225:8081/v1/users/login" //**** */

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

class Home extends React.Component{

	constructor(props){
		super(props);

		this.state = {
			viewport: {
				width: '90vw',
				height: '40vh',
				latitude: 15.8700,
				longitude: 100.9925,
				zoom: 5
			},
			visibleReq: false,
			visibleCancelReq: false,
			isMounted: false,
			curLocation_lat: null,
			curLocation_lng: null,
			ambuLocation_lat: null,
			ambuLocation_lng: null,
			statusReq: "พร้อมใช้งาน",
			phoneNumber: `null`,
			reqID: -1,
			req_bt_disabled_status: false,
			LPIncomingCar: `-`,
			CarID: -1,
			interval: null,
			datetime: null,
			trigger: -1,
			inReqCheckProcess: false,
			token: `null`,
			header_axios: {},
			loading: true,
		}

		this._initReset = () => {
			this.setState({
				viewport: {
					width: '90vw',
					height: '40vh',
					latitude: 15.8700,
					longitude: 100.9925,
					zoom: 5
				},
				visibleReq: false,
				visibleCancelReq: false,
				curLocation_lat: null,
				curLocation_lng: null,
				ambuLocation_lat: null,
				ambuLocation_lng: null,
				statusReq: "พร้อมใช้งาน",
				phoneNumber: `null`,
				reqID: -1,
				req_bt_disabled_status: false,
				LPIncomingCar: `-`,
				CarID: -1,
				interval: null,
				datetime: null,
				trigger: -1,
			})
		}
		
		// map render popup
		this._updateViewport = viewport => {
			this.setState({viewport});
		};

		this._updateSizeMap = () => {
			this.state.viewport.height = '40vh'
			this.state.viewport.width = '90vw'
		}

		// marker render
		this._renderMarkerUser = () => {
			if (this.state.curLocation_lat != null && this.state.curLocation_lng != null)
			{
				return(
					// return current location
					<Marker key={`marker-user`} latitude={this.state.curLocation_lat} longitude={this.state.curLocation_lng}>
						<MarkerPin size={30} stat_pin={`req`} pin_id={1} pin_info={`ตำแหน่งผู้ใช้`} />
					</Marker>
				);
			}
		}

		this._renderMarkerAmbulance = () => {
			if (this.state.statusReq == "กำลังมา" &&
			this.state.ambuLocation_lat != null &&
			this.state.ambuLocation_lng != null)
			{
				return(
					// return ambulance location
					<Marker key={`marker-ambu`} latitude={this.state.ambuLocation_lat} longitude={this.state.ambuLocation_lng}>
						<MarkerPin size={30} stat_pin={`u_car`} pin_id={2} pin_info={`ตำแหน่งรถพยาบาล`} />
					</Marker>
				);
			}
		}

		// button method
		this._onClickReqButton = () => {
			this.setState({
				visibleReq: true,
			})
		}

		this._onClickCancelReqButton = () => {
			this.setState({
				visibleCancelReq: true,
			})
		}

		// visible request modal method
		this._onClickOKReqModal = () => {
			// send request to server
			this._setSelfLocationAndSendToServer()
			
			this.setState({
				visibleReq: false,
			})
		}

		this._onClickCancelReqModal = () => {
			this.setState({
				visibleReq: false,
			})
		}

		// visible cancel request modal method
		this._onClickOKCancelReqModal = () => {
			// send cancel request to server
			this._cancelRequestAndFreeTheCar()
			
			this.setState({
				visibleCancelReq: false,
			})
		}

		this._onClickCancelCancelReqModal = () => {
			this.setState({
				visibleCancelReq: false,
			})
		}

		// location & axois request
		this._callGeoPermission = () => {
			var geo = navigator.geolocation;
			geo.getCurrentPosition(position => {
				var lng = parseFloat(position.coords.longitude);
				var lat = parseFloat(position.coords.latitude);
			})
		}
		this._setSelfLocationAndSendToServer = () => {
			this.setState({ loading: true })
			var geo = navigator.geolocation;
			if (geo){
				geo.getCurrentPosition(position => {
					var lng = parseFloat(position.coords.longitude);
					var lat = parseFloat(position.coords.latitude);
					
					// axios request to send data to server
					var loc_str = `${lat},${lng}`
					var pn = this.state.phoneNumber
					//var api_with_param = `${apiSendReq}/${pn},${loc_str}`
					var api_with_param = `${apiSendReq}/${pn}`
					var data_pass = {
						"PLOC" : `${loc_str}`
					}
					axios.post(`${api_with_param}`, data_pass, {
						withCredentials: true,
						headers: this.state.header_axios
					})
					.then(res => {
						var requestID = res.data.data["request_id"].split(":")[1]
						message.warning(`ส่งข้อความขอความช่วยเหลือเสร็จสิ้น`)

						this.setState({
						  statusReq: 'รอการตอบรับ',
						  req_bt_disabled_status: true,
						  reqID: requestID,
						  loading: false,
						})
					}).catch(err => {
						console.log(err)
						message.warning(`เกิดข้อผิดพลาดจากการส่งความช่วยเหลือ`)
						this.setState({ loading: false })
					})

					this.setState({
						curLocation_lat: lat,
						curLocation_lng: lng,
					})
				}, 
				showError => {
					console.log(`${showError}`)
					message.warning(`เกิดข้อผิดพลาดจากการระบุตำแหน่งจากแผนที่`)
					this.setState({ loading: false })
				}, 
				{enableHighAccuracy:true})
			}
			else{
				message.warning(`ไม่สามารถระบุตำแหน่งของผู้ใช้ได้: โปรดยืนยันการใช้สิทธิ์ (Allow GPS Permission)`)
				this.setState({ loading: false })
			}
		}

		this._reqChecking = () =>{
			this.state.inReqCheckProcess = true
			// php format
			//http://202.28.247.52/EMS/EMSReqMobile.php?ReqID=3
			// node format
			//https://api.cmugency.com/EMSReqMobile/ReqID
			var api_with_param = `${apiGetReqStatus}/${this.state.reqID}`
			axios.get(`${api_with_param}`, {
				withCredentials: true,
				headers: this.state.header_axios 
			})
			.then(res => {
				var data = `${res.data.data["0"]}`
				var req_stat_dat = data.split("|")[1].split(":")[1]
				if (req_stat_dat == "0"){
					var lat_get = parseFloat(data.split("|")[3].split(":")[1].split(",")[0])
					var lng_get = parseFloat(data.split("|")[3].split(":")[1].split(",")[1])
					this.state.curLocation_lat = lat_get
					this.state.curLocation_lng = lng_get
				}
				else if (req_stat_dat == "1"){
					var lp_str = data.split("|")[4].split(":")[1]
					var lat_c_get = parseFloat(data.split("|")[7].split(":")[1].split(",")[0])
					var lng_c_get = parseFloat(data.split("|")[7].split(":")[1].split(",")[1])
					var car_id = data.split("|")[9].split(":")[1]
					this.state.ambuLocation_lat = lat_c_get
					this.state.ambuLocation_lng = lng_c_get
					this.state.LPIncomingCar = lp_str
					this.state.statusReq = "กำลังมา"
					if (car_id == `null`){
						this.state.CarID = -1
					}
					else{
						this.state.CarID = car_id
					}
				}
				else if (req_stat_dat == "2"){
					this._initReset()
					this.setState({
						trigger: this.state.trigger*-1,
					})
			  	}
				else {
					this._initReset()
					this.setState({
						trigger: this.state.trigger*-1,
					})
				}
			  
				this.state.inReqCheckProcess = false
			})
			.catch(err => {
				console.log(err)
				this.state.inReqCheckProcess = false
			})
		}

		this._cancelRequestAndFreeTheCar = () => {
			this.setState({ loading: true })
			if (this.state.CarID == -1 && this.state.reqID == -1){
				message.warning(`ไม่สามารถยกเลิกการร้องขอได้ในขณะนี้`)
				this.setState({ loading: false })
			}
			else if (this.state.CarID == -1 && this.state.reqID != -1){
				var api_with_param = `${apiSendCancelReq}/${this.state.reqID}`
				axios.patch(`${api_with_param}`, {}, {
					withCredentials: true,
					headers: this.state.header_axios 
				})
				.then(res => {
					var res_message = `${res.data.status}`
					if (res_message == "true"){
						message.warning(`ยกเลิกการร้องขอสำเร็จ`)
						this.setState({ loading: false })
						this._initReset()
					}
					else{
						message.warning(`ไม่สามารถยกเลิกการร้องขอได้ในขณะนี้`)
						this.setState({ loading: false })
					}
				}).catch(err => {
					console.log(err)
					message.warning(`เกิดข้อผิดพลาดจากการยกเลิกการร้องขอ`)
					this.setState({ loading: false })
				})
			}
			else{
				// send cancel req to db
				// php api
				//http://202.28.247.52/EMS/EMSCancelReq.php?ReqID=55
				// nodejs api
				//https://10.10.182.218:8081/EMSCancelReq/ReqID
				var api_with_param = `${apiSendCancelReq}/${this.state.reqID}`
				axios.patch(`${api_with_param}`, {}, {
					withCredentials: true,
					headers: this.state.header_axios 
				})
				.then(res => {
					var res_message = `${res.data.status}`
					if (res_message == "true"){
						message.warning(`ยกเลิกการร้องขอสำเร็จ`)
						// nodejs
						//https://api.cmugency.com/EMSFreeCar/19
						var api_with_param_free_car = `${apiFreeCar}/${this.state.CarID}`
						axios.patch(`${api_with_param_free_car}`, {}, {
							withCredentials: true,
							headers: this.state.header_axios 
						})
						.then(res => {
							var res_message = `${res.data.status}`
							if (res_message == "true"){
								message.warning(`แจ้งยกเลิกการเรียกรถพยาบาลสำเร็จ`)
								this.setState({ loading: false })
							}
							else{
								message.warning(`แจ้งยกเลิกการเรียกรถพยาบาลล้มเหลว`)
								this.setState({ loading: false })
							}
							this._initReset()
							})
						.catch(err => {
							message.warning(`มีปัญหาการยกเลิกการเรียกรถ`)
							this.setState({ loading: false })
						})
					}
					else{
						message.warning(`ไม่สามารถยกเลิกการร้องขอได้ในขณะนี้`)
						this.setState({ loading: false })
					}
				}).catch(err => {
					console.log(err)
					message.warning(`เกิดข้อผิดพลาดจากการยกเลิกการร้องขอ`)
					this.setState({ loading: false })
				})
			}
		}

		this._startAutoAuthen = async() => {
			var is_found = false
            var token_data = ``
            var role_data = ``
			var data = {
				"username" : `test1`,
				"password" : `test1`
			}
			try {
				let res = await axios.post(apiLoginURL, data)
                token_data = `${res.data.data[`token`]}`
                role_data = `${res.data.data[`role`]}`
				if (res.data.status) { is_found = true }
			}
			catch (error) {
				console.log(error)
			}

			if (is_found) {
                if (role_data == 1)
                {
					
					// set token
					this.state.header_axios = {
						'Content-Type': 'application/json',
						"Accept": "application/json",
						'Authorization': `Bearer ${token_data}`
					}

					// start interval of app
					if (this.state.interval == null){
						this.state.interval = setInterval(() => this.setState({datetime: Date.now()}), 5000)
					}

                    this.setState({
                        token: token_data,
						isSetToken: true,
						loading: false,
                    })
                }
                else{
                    message.warning(`ชื่อผู้ใช้งานไม่ตรงตามเงื่อนไขการใช้บริการ`)
                }
			}
			else{
				message.warning(`ชื่อผู้ใช้หรือ รหัสผ่านไม่ถูกต้อง`)
			}
		}

		this._renderLoadingScreen = () => {
			const {loading} = this.state
			if (loading == true)
			{
				return (
					<LoadingScreen />
				)
			}
		}

	}

	render(){

		this._updateSizeMap()
		const { isMounted, loading } = this.state

		if (this.state.reqID != -1 && this.state.inReqCheckProcess == false){
			this._reqChecking()
		}

		if (loading == true){
			return(
				<div style={{height:'100vh', width:'100vw', background:'rgba(146,226,232,1)', zIndex:4}}>
					{this._renderLoadingScreen()}   
				</div>
			)
		}
		return(
			<div style={{height:'100vh', width:'100vw', background:'rgba(146,226,232,1)', zIndex:4}}>
				<Layout style={{background:'transparent', zIndex:8}}>                             
					<img
						//-- add here --
						src={HeaderImg} 
						alt='' 
						width='100%'
						style={{zIndex:7}}
						//------------ --
					/>
					<Button 
						onClick={this._onClickCancelReqButton}
						style={{
							marginLeft:'10vw',
							marginTop:'1vh',
							borderRadius: '15px',
							width:'30vw',
							background:'linear-gradient(90deg, rgba(218,45,45,1) 0%, rgba(235,130,66,1) 100%)',
							position:'absolute',
							zIndex:8
						}}
					block>
						<span style={{width:'100%', height:'100%', top:'50%'}}>
							<ScaleText minFontSize={10} maxFontSize={20}>ยกเลิกคำขอ</ScaleText>
						</span>
					</Button>
				</Layout>
				<Row 
					style={{
						height: '22vh',
						zIndex:6
					}}
				>
					<Row style={{height:'1vh'}}></Row>
					<Row type={"flex"} justify={"center"} align={"middle"} style={{height:'20vh'}}>
						<Col span={16}>
							<CardInfo lp_str={this.state.LPIncomingCar} status_str={this.state.statusReq} />
						</Col>
					</Row>
				</Row>
				<Row type={"flex"} justify={"center"} align={"middle"}
					style={{
						height: '45vh',
						zIndex:6
					}}
				>	
					<Layout
						style={{
							height: '45vh',
							width: '100vw',
							alignItems: 'center',
							justifySelf: 'center',
							backgroundColor:'transparent'
						}}
					>
						<Layout 
							style={{
								height: '45vh', 
								width: '95vw', 
								backgroundColor:'white',
								borderRadius: '10px',
								boxShadow: '0px 0px 5px #888888',
								borderColor: '#A8A8A8',
								alignItems: 'center',
								justifySelf: 'center',
								verticalAlign: 'middle',
								padding:'1vh 1vw 1vh 1vw',
								zIndex:6
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
				<Row style={{height: '1vh'}}></Row>
				<Row type={"flex"} justify={"center"} align={"middle"} gutter={8} 
					style={{
						height: '6vh',
						zIndex:6
					}}
				>
					<Col span={20}>
						<Button 
							onClick={this._onClickReqButton}
							style={{
								borderRadius:'20px',
								background:'linear-gradient(90deg, rgba(63,140,228,1) 0%, rgba(111,220,249,1) 100%)'
							}}
						block>
							<ScaleText minFontSize={10} maxFontSize={20}>ขอความช่วยเหลือ</ScaleText>
						</Button>
					</Col>
				</Row>

				<Modal
					title="หน้าต่างยืนยันการขอความช่วยเหลือ"
					visible={this.state.visibleReq}
					onOk={this._onClickOKReqModal}
					onCancel={this._onClickCancelReqModal}
					okText={"ยืนยัน"}
					cancelText={"ยกเลิก"}
					centered={true}
					zIndex={8}
				>
					<ScaleText minFontSize={8} maxFontSize={15}>คุณต้องการขอความช่วยเหลือหรือไม่ ?</ScaleText>
				</Modal>

				<Modal
					title="หน้าต่างยกเลิกการขอความช่วยเหลือ"
					visible={this.state.visibleCancelReq}
					onOk={this._onClickOKCancelReqModal}
					onCancel={this._onClickCancelCancelReqModal}
					okText={"ยืนยัน"}
					cancelText={"ยกเลิก"}
					centered={true}
					zIndex={8}
				>
					<ScaleText minFontSize={8} maxFontSize={15}>คุณต้องการยกเลิกการขอความช่วยเหลือหรือไม่ ?</ScaleText>
				</Modal>

			</div>
		)
	}

	// axois get request 
    componentDidMount() {
		this._callGeoPermission()
		this.state.isMounted = true
		this._startAutoAuthen()
	}
	
	componentWillUnmount() {
		message.warning(`component will mount`)
		clearInterval(this.state.interval)
	}

}

export default Home
