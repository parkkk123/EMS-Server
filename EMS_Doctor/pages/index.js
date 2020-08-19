import Router from 'next/router'
import React from 'react'
import 'antd/dist/antd.css';
import { Row, Col, Button, message, Input } from 'antd'
import ScaleText from 'react-scale-text';
import axios from 'axios';

const id_login = `admin`
const pass_login = `sansaihospital`

// for test panpark api login
const apiLoginURL = "http://10.10.182.225:8081/v1/users/login" //**** */

class Home extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			isMounted: false,
			username: ``,
			password: ``,
			token: ``,
			isSetToken: false,
		};

		this._onUsernameChange = e => {
			var { value } = e.target
			this.state.username = `${value}`
		}

		this._onPassWordChange = e => {
			var { value } = e.target
			this.state.password = `${value}`
		}
		
		this._initReset = () => {
			this.setState({
				username: ``,
				password: ``,
			})
		}

		this._onClickLoginButton = async() => {
			console.log('start login')
			var is_found = false
            var token_data = ``
            var role_data = ``
			var data = {
				"username" : `${this.state.username}`,
				"password" : `${this.state.password}`
			}
			console.log(`start axios`)
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
                if (role_data == 4)
                {
                    message.warning(`ลงชื่อเข้าใช้สำเร็จ`)
                    // set token and trig to set local stage
                    this.setState({
                        token: token_data,
                        isSetToken: true,
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

		this._ChangeToMonitorPage = () => {
			Router.push({
				pathname: '/monitor_page'
			})
		}
	}

	componentDidUpdate() {
		if (this.state.isSetToken == true) { 
			localStorage.setItem('_token', JSON.stringify(this.state.token)) 
			this._ChangeToMonitorPage()
		}
	}
	
	render(){
        console.log('------------ RENDER -------------')

		return(
			<div 
				style={{
					height:'100vh', 
					width:'100vw', 
					background:'linear-gradient(45deg, rgba(0,115,254,1) 0%, rgba(0,194,255,1) 100%)'
				}}
			>	
				<Row type={'flex'} justify={'center'} style={{height:'20vh', width:'99vw'}}></Row>
				<Row 
					type={'flex'}
					justify={'center'}
					style={{
						height:'50vh', 
						width:'35vw', 
						marginLeft:'35vw',
						boxShadow: '0px 0px 30px 3px #0088ef',
						background: 'white',
						borderRadius:'20px',
					}}
				>
					<Row 
						style={{
							height:'8vh', 
							width:'35vw',
							borderTopRightRadius:'20px',
							borderTopLeftRadius:'20px',
							background:'linear-gradient(90deg, rgba(1,193,255,1) 0%, rgba(1,119,255,1) 100%)'
						}}
					></Row>
					<Row style={{height:'4vh', width:'35vw'}}></Row>
					<Row style={{height:'6vh', width:'35vw', textAlign:'center', fontWeight:'bold'}}>
						<ScaleText maxFontSize={25}>ลงชื่อเข้าใช้ เข้าสู่ระบบ</ScaleText>
					</Row>
					<Row type={'flex'} align={'middle'} justify={'center'} style={{height:'4vh', width:'35vw'}}>
						<Col span={16}>
							<Input style={{height:'5vh'}} onChange={this._onUsernameChange} placeholder="ใส่หมายเลขผู้ใช้งาน" />
						</Col>
					</Row>
					<Row type={'flex'} align={'middle'} justify={'center'} style={{height:'4vh', width:'35vw'}}>
						<Col span={16}>
							<Input.Password style={{height:'5vh'}} onChange={this._onPassWordChange} placeholder="ใส่รหัสผ่าน" />
						</Col>
					</Row>
					<Row type={'flex'} align={'middle'} justify={'center'} style={{height:'6vh', width:'35vw'}}>
						<Col span={12} style={{textAlign:'center'}}>
							<Button onClick={this._onClickLoginButton} 
								style={{
									height:'4.5vh', 
									width:'15vw',
									borderRadius:'20px',
									background:'linear-gradient(90deg, rgba(1,193,255,1) 0%, rgba(1,119,255,1) 100%)'
								}}>
									เข้าสู่ระบบ
							</Button>
						</Col>
					</Row>
					<Row style={{height:'3vh', width:'95vw'}}></Row>
				</Row>
			</div>
		)
	}

	// axois get request 
    componentDidMount() {
		this.setState({ isMounted: true })
	}

// end class
}

export default Home
