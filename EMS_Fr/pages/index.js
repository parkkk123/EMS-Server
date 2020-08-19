import React from 'react'
import { Menu, Dropdown, Row, Col, Icon, Card, Button, Modal, message, Input } from 'antd'
import ScaleText from 'react-scale-text';
import Router from 'next/router'
import axios from 'axios'

import LoadingScreen from './../src/components/loading_screen'

const apiLoginURL = "http://10.10.182.225:8081/v1/users/login" //**** */

const id_pass = [
	['car1', '27656804'],
	['car2', '26489207'],
	['car3', '99841834'],
	['car4', '64303855'],
	['car5', '75464938'],
	['car6', '85949274'],
	['car7', '11737810'],
	['car8', '47410083'],
	['car9', '77914402'],
	['car10', '8564639'],
	['car11', '39577616'],
	['car12', '12458573'],
	['car13', '12512456'],
	['car14', '67604906'],
	['car15', '74153618'],
	['car16', '48586057'],
	['car17', '61070475'],
	['car18', '32056085'],
	['car19', '47255383'],
	['car20', '59283766'],
]

class Home extends React.Component{

	constructor(props){
		super(props);

		this.state = {
			isMounted: false,
			username: ``,
			password: ``,
			loading: true,
		}

		this._initReset = () => {
			this.setState({
				username: ``,
				password: ``,
			})
		}

		this._onUsernameChange = e => {
			var { value } = e.target
			this.state.username = `${value}`
		}

		this._onPassWordChange = e => {
			var { value } = e.target
			this.state.password = `${value}`
		}

		this._onClickLoginButton = async() => {
			this.setState({ loading: true })

			var is_found = false
            var token_data = ``
			var role_data = ``
			
			var data = {
				"username" : `${this.state.username}`,
				"password" : `${this.state.password}`
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
                if (role_data == 3)
                {
					message.warning(`ลงชื่อเข้าใช้สำเร็จ`)
					// set token and trig to set local stage
					this.setState({
						token: token_data,
						isSetToken: true,
					})
				}
				else
				{
                    message.warning(`ชื่อผู้ใช้งานไม่ตรงตามเงื่อนไขการใช้บริการ`)
					this.setState({ loading: false })
                }
			}
			else{
				message.warning(`ชื่อผู้ใช้หรือ รหัสผ่านไม่ถูกต้อง`)
				this.setState({ loading: false })
			}
		}

		this._ChangeToFRPage = () => {
			Router.push({
				pathname: '/fr_page'
			})
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

	componentDidUpdate() {
		if (this.state.isSetToken == true) { 
			localStorage.setItem('_token', JSON.stringify(this.state.token)) 
			this._ChangeToFRPage()
		}
	}

	render(){
		console.log(`---render---`)
		const { isMounted } = this.state
		
		return(
			<div 
				style={{
					height:'100vh', 
					width:'100vw', 
					backgroundColor:'rgb(48,66,90)',
				}}
			>	
				{this._renderLoadingScreen()}
				<Row style={{height:'17vh', width:'100vw'}}></Row>
				<Row type={'flex'} align={'middle'} justify={'center'}
					style={{
						height:'8vh', 
						width:'100vw', 
						color:'white',
						fontWeight:'10px'
					}}>
					<Col span={18} style={{height:'100%', textAlign:'center'}}>
						<ScaleText minFontSize={15} maxFontSize={40}>ระบบรถฉุกเฉิน</ScaleText>
					</Col>
				</Row>
				<Row type={'flex'} align={'middle'} justify={'center'}
					style={{
						height:'3vh', 
						width:'100vw', 
						color:'#6fdcf9',
						fontWeight:'10px'
					}}>
					<Col span={10} style={{height:'100%', textAlign:'center'}}>
						<ScaleText minFontSize={8} maxFontSize={15}>Ambulance App</ScaleText>
					</Col>
				</Row>
				<Row style={{height:'32vh', width:'100vw'}}></Row>
				<Row 
					style={{
						height:'32vh', 
						width:'100vw', 
						backgroundColor:'transparant'
					}}
				>
					<Row style={{height:'3vh', width:'100vw'}}></Row>
					<Row type={'flex'} align={'middle'} justify={'center'} style={{height:'6vh', width:'100vw'}}>
						<Col span={12}>
							<Input onChange={this._onUsernameChange} placeholder="ใส่หมายเลขผู้ใช้งาน" />
						</Col>
					</Row>
					<Row type={'flex'} align={'middle'} justify={'center'} style={{height:'6vh', width:'100vw'}}>
						<Col span={12}>
							<Input.Password onChange={this._onPassWordChange} placeholder="ใส่รหัสผ่าน" />
						</Col>
					</Row>
					<Row style={{height:'2vh', width:'100vw'}}></Row>
					<Row type={'flex'} align={'middle'} justify={'center'} style={{height:'6vh', width:'100vw'}}>
						<Col span={20} style={{textAlign:'center'}}>
							<Button onClick={this._onClickLoginButton} 
							style={{
								height:'4.5vh', 
								width:'50vw',
								backgroundColor:'#6fdcf9'
							}}>
								<ScaleText minFontSize={8} maxFontSize={20}>ลงชื่อเข้าใช้</ScaleText>
							</Button>
						</Col>
					</Row>
					<Row style={{height:'3vh', width:'100vw'}}></Row>
				</Row>
			</div>
		)
	}

	componentDidMount() {
		this.setState({ isMounted: true, loading: false })
	}

}

export default Home