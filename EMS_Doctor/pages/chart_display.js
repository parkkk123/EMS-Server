import React from 'react'
import 'antd/dist/antd.css';
import { Layout, Row, Col, Button, message, Modal, Icon } from 'antd'
import axios from 'axios'
import window from 'global'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Popup from "reactjs-popup";
import ScaleText from 'react-scale-text';

var is_render = false;
const apiecgchartURL = "https://api.cmugency.com/ECGQuery/"
const apihrbpblood = "https://api.cmugency.com/O2HRBPQuery/"
let timer_1 = null;
let timer_2 = null;
var req_num = 11;
class ChartDisplay extends React.Component {
    static jsfiddleUrl = 'https://jsfiddle.net/alidingling/xqjtetw0/';
	constructor(props){
		super(props);
		this.state = {
			isMounted: false,
			req_id_now: -1,
            car_id_now: -1,
            timer_1: null,
            timer_2: null,
            listData: [],
            blood_sys : 0,
            blood_dia : 0,
            o2 : 0,
            hr : 0,
            data_chart_0: [],
            data_chart_1: [],
            data_chart_2: [],
            data_chart_3: [],
            data_chart_4: [],
            data_chart_5: [],
            data_chart_6: [],
            data_chart_7: [],
            data_chart_8: [],
            data_chart_9: [],
            data_chart_10: [],
            data_chart_11: [],
            data_chart_12: [],
            data_chart_null: [{name: 0, value: null}]
        }
        
        this._GetParamInit = () => {
            if (window.location)
            {
                const query = new URLSearchParams(global.window.location.search.substring(1));

                const car_id = query.get('car_id_q')
                console.log(`car id: ${car_id}`)
                this.state.car_id_now = parseInt(car_id)

                const req_id = query.get('req_id_q')
                console.log(`req_id: ${req_id}`)
                this.state.req_id_now = parseInt(req_id)
            }
            else{
                console.log(`failed to load query from previous page`)
            }
        }

        this._getRandomData = () => {
            const randomYData = [...new Array(100)].map(() =>
                Math.round(Math.random() * 40)
            );
            return randomYData.map((val, idx) => {
                return {x: idx, y: val};
            });
        }

        this._fetchnewStatedata = (cc) => {
            var data_new = []
            if (cc == 0) { data_new = this.state.data_chart_0 }
            if (cc == 1) { data_new = this.state.data_chart_1 }
            if (cc == 2) { data_new = this.state.data_chart_2 }
            if (cc == 3) { data_new = this.state.data_chart_3 }
            if (cc == 4) { data_new = this.state.data_chart_4 }
            if (cc == 5) { data_new = this.state.data_chart_5 }
            if (cc == 6) { data_new = this.state.data_chart_6 }
            if (cc == 7) { data_new = this.state.data_chart_7 }
            if (cc == 8) { data_new = this.state.data_chart_8 }
            if (cc == 9) { data_new = this.state.data_chart_9 }
            if (cc == 10) { data_new = this.state.data_chart_10 }
            if (cc == 11) { data_new = this.state.data_chart_11 }

            try{
                for (let i = 0; i < this.state.listData[cc].chart_value.length; i++) {
                    data_new[i] = {
                        name: i,
                        value_data: this.state.listData[cc].chart_value[i]
                    }
                }
            }catch{
                for (let i = 0; i < 500; i++) {
                    data_new[i] = {
                        name: i,
                        value_data: 0
                    }
                }
            }

            return data_new
        };

        this._reloadecg = () => {
            axios.get(`${apiecgchartURL}${this.state.req_id_now}`)
                .then(res => {
                    console.log('get new ecg data')
                    var listdata_temp = []
                    var data_lst = res.data
                    // console.log(data_lst)
                    for (let i = 0; i < data_lst.length; i++) {
                        var row_dat = data_lst[i].trim().split("|")
                        var trd = row_dat[0].trim().split(":")[1].trim()
                        var devtype_id = row_dat[1].trim().split(":")[1].trim()
                        var dev_id = row_dat[2].trim().split(":")[1].trim()
                        // var timestamp

                        var data_chart = row_dat[4].trim().split(":")[1].trim().split(",")
                        // console.log(data_chart)
                        listdata_temp.push({
                            TrId: trd,
                            DevTypeID: devtype_id,
                            DevID: dev_id,
                            chart_value: data_chart
                        });
                    }
                    this.setState({
                        listData: listdata_temp
                    })
                }).catch(e => {
                    console.log('asdasdas');
                });
        }

        this._reloadhrbp = () => {
            axios.get(`${apihrbpblood}${this.state.req_id_now}`)
                .then(res => {
                    console.log('get new hrbpb data')
                    var data_lst = res.data
                    for (let i = 0; i < data_lst.length; i++) {
                        this.setState({
                            blood_sys: data_lst[i].trim().split("|")[5].trim().split(":")[1].trim().split(",")[0],
                            blood_dia: data_lst[i].trim().split("|")[5].trim().split(":")[1].trim().split(",")[1],
                            o2: data_lst[i].trim().split("|")[3].trim().split(":")[1].trim().split(",")[0],
                            hr: data_lst[i].trim().split("|")[3].trim().split(":")[1].trim().split(",")[1]
                        })
                    }

                })
        }

        this._isfirststate = () => {
            // console.log('in funct first = 0')
            is_render = false;
            this._reloadecg()
            this._reloadhrbp()
            this.state.timer_2 = setTimeout(() => this._issecondstate(), 250);
            this.setState(
                {
                    data_chart_0: [],
                    data_chart_1: [],
                    data_chart_2: [],
                    data_chart_3: [],
                    data_chart_4: [],
                    data_chart_5: [],
                    data_chart_6: [],
                    data_chart_7: [],
                    data_chart_8: [],
                    data_chart_9: [],
                    data_chart_10: [],
                    data_chart_11: []
                }
            );
        }

        this._issecondstate = () => {
            // console.log('in funct first = 1')
            is_render = true
            this.setState(
                {
                    data_chart_0: [this._fetchnewStatedata(0).values(), ...this.state.data_chart_0],
                    data_chart_1: [this._fetchnewStatedata(1).values(), ...this.state.data_chart_1],
                    data_chart_2: [this._fetchnewStatedata(2).values(), ...this.state.data_chart_2],
                    data_chart_3: [this._fetchnewStatedata(3).values(), ...this.state.data_chart_3],
                    data_chart_4: [this._fetchnewStatedata(4).values(), ...this.state.data_chart_4],
                    data_chart_5: [this._fetchnewStatedata(5).values(), ...this.state.data_chart_5],
                    data_chart_6: [this._fetchnewStatedata(6).values(), ...this.state.data_chart_6],
                    data_chart_7: [this._fetchnewStatedata(7).values(), ...this.state.data_chart_7],
                    data_chart_8: [this._fetchnewStatedata(8).values(), ...this.state.data_chart_8],
                    data_chart_9: [this._fetchnewStatedata(9).values(), ...this.state.data_chart_9],
                    data_chart_10: [this._fetchnewStatedata(10).values(), ...this.state.data_chart_10],
                    data_chart_11: [this._fetchnewStatedata(11).values(), ...this.state.data_chart_11]
                }
            );
            this.state.timer_1 = setTimeout(() => this._isfirststate(), 2750);
        }

        this._setupStatevalue = () => {
            var arr = [];
            for (var i = 0; i < 500; i++) {
                arr.push({
                    name: i,
                    value: null
                });
            }
            return arr
        }

        this._renderbutton = (name,chart_num) => {
            return (<Popup
                trigger={<center><b>
                    <Button
                        type="primary" ghost
                        style={{
                            flex: 1,
                            marginRight: '10px'
                        }}
                    >
                        {name}
                    </Button></b></center>}
                modal
                closeOnDocumentClick
            >
                <span
                    style={{
                        fontSize: 24,
                        width: '2000px',
                        padding: '15px 15px 20px 30px'   
                    }}>
                    <center><b>{name}</b></center>
                    {this._renderbiggarph(chart_num)}

                </span>
            </Popup>);
        }

        this._renderbiggarph = (chart_num, width_size = '100%', size = 450) => {
            if (is_render == true) {
                return (
                    <ResponsiveContainer key={1} width={width_size} height={size}>
                        <LineChart data={chart_num}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            {/* <CartesianGrid horizontalPoints={[50]} /> */}
                            <YAxis domain={[0, 100]} />
                            <XAxis tick={false} />
                            <Line type="monotone" dataKey='value_data' stroke="	#00FF00"     dot={false}
                                animationBegin={0}
                                animationDuration={5000}
                                isAnimationActive={true}
                                onClick={this._clickChart}
                                animationEasing={'linear'}
                                strokeWidth = {1.5}
                            // onAnimationEnd = {this._reloadecg()}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            } else {
                return (
                    <ResponsiveContainer key={0} width={width_size} height={size}>
                        <LineChart data={this.state.data_chart_null}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <YAxis domain={[0, 100]} />
                            <XAxis tick={false} />
                            <Line type="line" dataKey="value_data" stroke="#FF69B4" dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            }
        }

        this._rendergraph = (chart_num, width_size = '100%', size = 100) => {
            if (is_render == true) {
                return (
                    <ResponsiveContainer key={1} width={width_size} height={size}>
                        <LineChart data={chart_num}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            {/* <CartesianGrid horizontalPoints={[50]} /> */}
                            <YAxis domain={[0, 100]} hide={true}/>
                            <XAxis tick={false} />
                            <Line type="monotone" dataKey='value_data' stroke="	#00FF00"     dot={false}
                                animationBegin={0}
                                animationDuration={2500}
                                isAnimationActive={true}
                                onClick={this._clickChart}
                                animationEasing={'linear'}
                                strokeWidth = {1.5}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            } else {
                return (
                    <ResponsiveContainer key={0} width={width_size} height={size}>
                        <LineChart data={this.state.data_chart_null}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            {/* <YAxis domain={[25, 75]} /> */}
                            <XAxis tick={false} />
                            <Line type="line" dataKey="value_data" stroke="#FF69B4" dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            }
        }

    }

    render(){
        console.log('render')

        if(this.state.isMounted == false){
            this._GetParamInit()
        }

        const data1 = this._getRandomData()

        return(
            <div>
                <Layout
                    style={{
                        backgroundColor: 'transparent',
                        alignItems: 'center',
                        justifySelf: 'center',
                        padding: '20px',
                    }}
                >
                    <Layout
                        style={{
                            width: '100%',
                            height: '100%',
                            borderStyle: 'solid',
                            borderRadius: '20px',
                            borderWidth: '1px',
                            borderColor: '#A8A8A8',
                            // alignItems: 'center',
                            justifySelf: 'center',
                            padding: '15px 60px 0px 25px',
                            backgroundColor: '#000' 
                        }}
                    >

                        <Row>
                            <Col span={12}>
                                {this._renderbutton('Lead 1',this.state.data_chart_0)}
                                {this._rendergraph(this.state.data_chart_0)}
                            </Col>
                            <Col span={12}>
                                {this._renderbutton('Lead 2',this.state.data_chart_1)}
                                {this._rendergraph(this.state.data_chart_1)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {this._renderbutton('Lead 3',this.state.data_chart_2)}
                                {this._rendergraph(this.state.data_chart_2)}
                            </Col>
                            <Col span={12}>
                                {this._renderbutton('aVR',this.state.data_chart_3)}
                                {this._rendergraph(this.state.data_chart_3)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {this._renderbutton('aVL',this.state.data_chart_4)}
                                {this._rendergraph(this.state.data_chart_4)}
                            </Col>
                            <Col span={12}>
                                {this._renderbutton('aVF',this.state.data_chart_5)}
                                {this._rendergraph(this.state.data_chart_5)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {this._renderbutton('V1',this.state.data_chart_6)}
                                {this._rendergraph(this.state.data_chart_6)}
                            </Col>
                            <Col span={12}>
                                {this._renderbutton('V2',this.state.data_chart_7)}
                                {this._rendergraph(this.state.data_chart_7)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {this._renderbutton('V3',this.state.data_chart_8)}
                                {this._rendergraph(this.state.data_chart_8)}
                            </Col>
                            <Col span={12}>
                                {this._renderbutton('V4',this.state.data_chart_9)}
                                {this._rendergraph(this.state.data_chart_9)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {this._renderbutton('V5',this.state.data_chart_10)}
                                {this._rendergraph(this.state.data_chart_10)}
                            </Col>
                            <Col span={12}>
                                {this._renderbutton('V6',this.state.data_chart_11)}
                                {this._rendergraph(this.state.data_chart_11)}
                            </Col>
                        </Row>
                    </Layout>
                </Layout>
            </div>
        )
    }

	componentDidMount() {
        this.state.isMounted = true
        this._isfirststate()
	}

    componentWillUnmount() {
        console.log('unmount timer state...')
        clearInterval(this.state.interval);
        clearInterval(this.state.timer_1);
        clearInterval(this.state.timer_2);
    }

}

export default ChartDisplay