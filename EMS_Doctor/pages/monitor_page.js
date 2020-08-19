import React from 'react'
import 'antd/dist/antd.css';
import { Menu, Icon, Layout, List, Avatar, Button, message, Modal, Row, Col, Spin } from 'antd'
import ReactMapGL, { Marker, NavigationControl, FullscreenControl } from 'react-map-gl';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MarkerPin from './map-pin';
import axios from 'axios'
import ScaleText from 'react-scale-text';
import Router from 'next/router'
import Popup from "reactjs-popup";

import DocImg from './../src/img/doc_im.png';
import DocImgRotate from './../src/img/doc_im_rotate.png';
import HeaderImg from './../src/img/header.png';
import Loadpage from './../src/img/Loading.gif';

//import Loader from 'react-loader-spinner'

var is_render = false;
const apiRequestURL = "https://tapi.cmugency.com/v1/others/EMSReq"
const apiecgchartURL = "https://tapi.cmugency.com/v1/others/ECGQuery/"
const apihrbpblood = "https://tapi.cmugency.com/v1/others/O2HRBPQuery/"
const apiGetMeURL = "https://tapi.cmugency.com/v1/users/me"
/// note
/// index on digital value data list 
const blood_sys_dv_idx = 0
const blood_dia_dv_idx = 1
const o2_dv_idx = 2
const hr_dv_idx = 3
const o2_pulse_idx = 4

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

// mock data
// data: [
// 	{
// 		id:1,
// 		value:`req1`,
// 		lat_c: 18.7953,
// 		lng_c: 98.9620,
// 		title_c: `Car ID 1`,
// 		description_c: `License Plate: กก1111`,
// 		p_color_c: `u_car`,
// 		lat_p: 18.79,
// 		lng_p: 98.96,
// 		title_p: `Patient ID 1`,
// 		description_p: `Patient from amb`,
// 		p_color_p: `req`
// 	},
// 	{
// 		id:2,
// 		value:`req2`,
// 		lat_c: 19.9105,
// 		lng_c: 99.8406,
// 		title_c: `Car ID 2`,
// 		description_c: `License Plate: ขข2222`,
// 		p_color_c: `u_car`,
// 		lat_p: 19.905,
// 		lng_p: 99.835,
// 		title_p: `Patient ID 2`,
// 		description_p: `Patient from amb`,
// 		p_color_p: `req`
// 	}
// ]

class MonitorPage extends React.Component {
    static jsfiddleUrl = 'https://jsfiddle.net/alidingling/xqjtetw0/';
	constructor(props){
		super(props);
		this.state = {
            id_now: -1,
            req_idx_now: -1,
			req_id_now: -1,
			car_id_now: -1,
			visibleMap: false,
			viewport: {
				width: '80vw',
				height: '50vh',
				latitude: 18.7953,
				longitude: 98.9620,
				zoom: 13
			},
			data: [
				{
					id:11,
					req_id: 11,
					car_id: 19,
					value:`req 1`,
					lat_c: 18.7953,
					lng_c: 98.9620,
					title_c: `Car ID 1`,
					lc_c: `กก 1111`,
					description_c: `License Plate: กก1111`,
					p_color_c: `u_car`,
					lat_p: 18.79,
					lng_p: 98.96,
					title_p: `Patient ID 1`,
					description_p: `Patient from amb`,
					p_color_p: `req`
				}
			],
            /// list data note
            /// dimension 0 : request index
            /// listData[i] -> object that has 5 property
            /// 1. id {listData[i].id} -> show the request id
            /// 2. listdata_temp {listData[i].listdata_temp} (array of chart) -> store the 12 lead of ecg on array
            ///     2.1. listdata_temp has 12 dimensions 
            ///     2.2. each dimension is the lead of ecg
            ///     2.3. for example dimension 0 is ecg lead 1 
            /// 3. delay {listData[i].delay} -> status of delay 
            ///     3.1. false when this list is on delayed stage
            ///     3.2. true when finished delay
            /// 4. dv_data {listData[i].dv_data} (digital value data) -> store all of digital value
            ///     digital value list data note {Array 2 dimensions} 
            ///     dimension 0 : type of digital value data (we have const that used to index the type of digital value)
            ///     dimension 1 : value in array of each digital value
            /// 5. stack_dv {listData[i].stack_dv} (stack digital value) -> use for calculate pushing of digital value
            ///     description : if dv is over 500 -> add the value to array 
            /// 6. mode_now {listData[i].mode_now} -> use for remember the mode of ekg 
            listData: [],

            timer_1 : null,
            timer_2 : null,
            timer_3 : null,
            req_data_list : [],
            data: [],
            data_show_chart: [],
            data_show_dv : [],
            data_chart_null: [{name: 0, value: null}],
            is_success_load_first_time : false,
			token: `null`,
			header_axios: {},
		};

		///////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////
		//////////////////////////////     FOR DATA MANAGEMENT   //////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////

        this._fetchnewStatedata = () => {
            var data_all = []
            
            for (let i = 0; i < this.state.listData.length; i++){
                let length_of_data = this.state.listData[i].data[1].chart_value.length
                let delay_status = this.state.listData[i].delay
                if (delay_status == false){
                    if (length_of_data >= 1500){
                        this.state.listData[i].delay = true
                        delay_status = true
                    }
                }
                else{
                    if (length_of_data < 500){
                        this.state.listData[i].delay = false
                        delay_status = false
                    }
                }

                if (delay_status == true){
                    // can show the delayed chart
                    let list_of_chart = []
                    for (let j = 0; j < this.state.listData[i].data.length; j++){
                        let data_each_chart = []
                        let count_m1 = 0
                        let sum = 0
                        for (let k = 0; k < 500; k++){
                            let chart_value = parseInt(this.state.listData[i].data[j].chart_value[0])
                            if (chart_value == -1) { count_m1 = count_m1 + 1 }
                            sum = sum + chart_value
                            data_each_chart[k] = {
                                name: k,
                                value_data: chart_value
                            }
                            this.state.listData[i].data[j].chart_value.splice(0, 1)
                        }
                        if (count_m1 > 250) { 
                            data_each_chart[0] = {
                                name: 0,
                                value_data: -1
                            } 
                        }
                        else { 
                            data_each_chart[0] = {
                                name: 0,
                                value_data: sum/500
                            }
                        }
                        list_of_chart.push(data_each_chart)
                    }
                    data_all.push({
                        id: this.state.listData[i].id,
                        data: list_of_chart
                    })

                    // can show the delayed digital value
                    let data_dv_show = []
                    data_dv_show.push(this.state.listData[i].dv_data[blood_sys_dv_idx][0])
                    data_dv_show.push(this.state.listData[i].dv_data[blood_dia_dv_idx][0])
                    data_dv_show.push(this.state.listData[i].dv_data[o2_dv_idx][0])
                    data_dv_show.push(this.state.listData[i].dv_data[hr_dv_idx][0])
                    data_dv_show.push(this.state.listData[i].dv_data[o2_pulse_idx][0])
                    // splice front data
                    this.state.listData[i].dv_data[blood_sys_dv_idx].splice(0, 1)
                    this.state.listData[i].dv_data[blood_dia_dv_idx].splice(0, 1)
                    this.state.listData[i].dv_data[o2_dv_idx].splice(0, 1)
                    this.state.listData[i].dv_data[hr_dv_idx].splice(0, 1)
                    this.state.listData[i].dv_data[o2_pulse_idx].splice(0, 1)

                    this.state.data_show_dv = data_dv_show
                }
                else{
                    // can't show that chart
                    let list_of_chart = []
                    for (let j = 0; j < this.state.listData[i].data.length; j++){
                        let data_each_chart = []
                        data_each_chart[0] = {
                            name: 0,
                            value_data: -2,
                        }
                        list_of_chart.push(data_each_chart)
                    }

                    data_all.push({
                        id: this.state.listData[i].id,
                        data: list_of_chart
                    })

                    // can't show dv
                    let data_dv_show = []
                    for (let i = 0; i < 5; i++) {
                        data_dv_show.push(-2)
                    }
                    this.state.data_show_dv = data_dv_show
                }
            }
            return data_all
        };
		
		this._reloadReq = () => {
            axios.get(`${apiRequestURL}`, {
				withCredentials: true,
				headers: this.state.header_axios 
			})
            .then(res => {
                var req_lst_tmp = []
                var count = 0
                var json_data_lst = res.data.data
                var data_lst = []
                for (let j in json_data_lst){
                    data_lst.push(json_data_lst[j])
                }
                for (let i = 0; i < data_lst.length; i++){
                    var row_dat = data_lst[i].trim().split("|")
                    if (row_dat[1].trim().split(":")[1].trim() == "1"){
                        var req_id = row_dat[0].trim().split(":")[1].trim()
                        var req_status = row_dat[1].trim().split(":")[1].trim()
                        var req_date = row_dat[2].trim().split(":")[1].trim()
                        var accept_date = row_dat[3].trim().split(":")[1].trim()
                        var mb_numb = row_dat[4].trim().split(":")[1].trim()

                        // trap bug wrong string from latitude longitude of patient
                        var str_p_lat = row_dat[5].trim().split(":")[1].split(",")[0].trim()
                        var str_p_lng = row_dat[5].trim().split(":")[1].split(",")[1].trim()
                        if (str_p_lat == "" || str_p_lng == "") { continue }

                        var p_lat = parseFloat(str_p_lat)
                        var p_lng = parseFloat(str_p_lng)

                        // car get information
                        var lc_c = row_dat[6].trim().split(":")[1].trim()
                        var dev_id_c = row_dat[7].trim().split(":")[1].trim()
                        
                        // trap bug wrong string from latitude longitude of car
                        var str_c_lat = row_dat[9].trim().split(":")[1].split(",")[0].trim()
                        var str_c_lng = row_dat[9].trim().split(":")[1].split(",")[1].trim()
                        if (str_c_lat == "" || str_c_lng == "") { continue }

                        var c_lat = parseFloat(str_c_lat)
                        var c_lng = parseFloat(str_c_lng)

                        req_lst_tmp.push({
                            id: count,
                            value: req_id,
                            status: req_status,
                            title_p: `Request Number : ${req_id}`,
                            title_show: `Request Number : ${req_id}`,
                            avatar: <Avatar size={48} icon="file-exclamation"/>,
                            description_p:
                            `Mobile Number : ${mb_numb}, Accept Date |${accept_date}`,
                            description_show:
                            `Mobile Number : ${mb_numb}, Request Date : ${req_date}, Accept Date : ${accept_date}`,
                            lat_p: p_lat,
                            lng_p: p_lng,
                            p_color_p: "req",
                            title_c: `Car ID : ${dev_id_c}`,
                            description_c: `License Plate: ${lc_c}`,
                            p_color_c: `u_car`,
                            lat_c: c_lat,
                            lng_c: c_lng,
                        });
                        count++
                    }
                }

                this.state.req_data_list = req_lst_tmp
                // clear request before reload ecg signal
                this._clearListData()
                this._reloadecg()
            })
            .catch(e => {
                console.log(`error message: ${e}`)
            })
		}

        this._clearListData = () => {
            let new_list_data_temp = []
            for (let i = 0; i < this.state.listData.length; i++){
                for (let j = 0; j < this.state.req_data_list.length; j++){
                    let req_list_data = this.state.listData[i].id
                    let req_from_load = this.state.req_data_list[j].value
                    if (req_list_data == req_from_load){
                        new_list_data_temp.push(this.state.listData[j])
                        break
                    }
                }
            }
            this.state.listData = new_list_data_temp
        }

        this._reloadecg = () => {
            console.log(this.state.req_data_list.length)
            // for all req
            for (let j = 0; j < this.state.req_data_list.length; j++)
            {
                var req_num = this.state.req_data_list[j].value
                var is_new_req = this._isNewReq(req_num)
                if (is_new_req){
                    this._pushNewListDataRequest(req_num)
                }
                axios.get(`${apiecgchartURL+req_num}`, {
                    withCredentials: true,
                    headers: this.state.header_axios 
                })
                .then(res => {
                    var json_data_lst = res.data.data
                    var data_lst = []
                    for (let j in json_data_lst){
                        data_lst.push(json_data_lst[j])
                    }
                    
                    let data_chart_lead2 = data_lst[1].trim().split("|")[4].trim().split(":")[1].trim().split(",")
                    let status_mode = data_chart_lead2[data_chart_lead2.length - 1]
                    let is_push_data = true
                    
                    for (let i = 0; i < data_lst.length; i++) {
                        var row_dat = data_lst[i].trim().split("|")
                        var trd = row_dat[0].trim().split(":")[1].trim()
                        var devtype_id = row_dat[1].trim().split(":")[1].trim()
                        var dev_id = row_dat[2].trim().split(":")[1].trim()
						let time_set1 = row_dat[3].trim().split(":")[1].trim()
						let time_set2 = row_dat[3].trim().split(":")[2].trim()
						let time_set3 = row_dat[3].trim().split(":")[3].trim()
                        var time_st = ``.concat(time_set1, `:`, time_set2, `:`, time_set3)
                        var data_chart = row_dat[4].trim().split(":")[1].trim().split(",")
                        // cut data chart when it lead 2 for get status 
                        let len_data = data_chart.length
                        if (i == 1){
                            data_chart.splice(len_data - 1)
                        }

                        // new data push
                        let is_push_data_tmp = this._pushDataToListData(trd, devtype_id, dev_id, time_st, data_chart, req_num, i, status_mode)
                        if (status_mode == 0 && i == 1){
                            is_push_data=is_push_data_tmp
                        }
                    }

                    if (is_push_data == true) { this._reloadhrbp(status_mode, req_num) }
                }).catch(e => {
                    console.log(`error message: ${e}`);
                });
            }

        }

        this._reloadhrbp = (status_mode, req_num) => {
            // load all of hrbr
            axios.get(`${apihrbpblood+req_num}`, {
				withCredentials: true,
				headers: this.state.header_axios 
			})
                .then(res => {
                    var json_data_lst = res.data.data
                    var data_lst = []
                    for (let j in json_data_lst){
                        data_lst.push(json_data_lst[j])
                    }

                    let blood_sys = data_lst[0].trim().split("|")[5].trim().split(":")[1].trim().split(",")[0]
                    let blood_dia = data_lst[0].trim().split("|")[5].trim().split(":")[1].trim().split(",")[1]
                    let o2_dv = data_lst[0].trim().split("|")[3].trim().split(":")[1].trim().split(",")[0]
                    let hr_dv = data_lst[0].trim().split("|")[3].trim().split(":")[1].trim().split(",")[1]
                    let o2_pulse = data_lst[0].trim().split("|")[3].trim().split(":")[1].trim().split(",")[2]

                    let o2_timeset1 = data_lst[0].trim().split("|")[4].trim().split(":")[1].trim()
                    let o2_timeset2 = data_lst[0].trim().split("|")[4].trim().split(":")[2].trim()
                    let o2_timeset3 = data_lst[0].trim().split("|")[4].trim().split(":")[3].trim()
                    let o2_time_st = ``.concat(o2_timeset1, `:`, o2_timeset2, `:`, o2_timeset3)
                    
                    let bp_timeset1 = data_lst[0].trim().split("|")[6].trim().split(":")[1].trim()
                    let bp_timeset2 = data_lst[0].trim().split("|")[6].trim().split(":")[2].trim()
                    let bp_timeset3 = data_lst[0].trim().split("|")[6].trim().split(":")[3].trim()
                    let bp_time_st = ``.concat(bp_timeset1, `:`, bp_timeset2, `:`, bp_timeset3)

                    this._pushDVToListData(req_num, blood_sys, blood_dia, o2_dv, hr_dv, o2_pulse, o2_time_st, bp_time_st, status_mode)
                    
                })
        }

        this._isNewReq = (req) => {
            var is_new = true
            for (let i = 0; i < this.state.listData.length; i++){
                var req_of_list = this.state.listData[i].id
                if (req_of_list == req){
                    is_new = false
                    break
                }
            }

            return is_new
        }

        this._pushNewListDataRequest = (req) => {
            let listdata_temp = []
            for (let i = 0; i < 12; i++) {
                listdata_temp.push({
                    chartNo: i,
                    TrId: -1,
                    DevTypeID: -1,
                    DevID: -1,
                    chart_value: []
                });
            }

            let dv_data_temp = []
            for (let i = 0; i < 5; i++){
                dv_data_temp.push([])
            }

            this.state.listData.push({
                id : req,
                data : listdata_temp,
                delay : false,
                dv_data : dv_data_temp,
                stack_dv: 0,
                mode_now: -1
            })
        }

        this._idxInListData = (req) => {
            for (let i = 0; i < this.state.listData.length; i++){
                if (this.state.listData[i].id == req){
                    return i
                }
            }
        }

        this._idxInShowChartListData = (req) => {
            for (let i = 0; i < this.state.data_show_chart.length; i++){
                if (this.state.data_show_chart[i].id == req){
                    return i
                }
            }
        }

        this._pushDVToListData = (req, blood_sys, blood_dia, o2_dv, hr_dv, o2_pulse, o2_time_st, bp_tim2_st, mode) => {
            let idx = this._idxInListData(req)
            let stack_now = this.state.listData[idx].stack_dv
            // time check
            let today_date = new Date()
            // o2 time check
            let o2_time_st_date = new Date(`${o2_time_st}`)
            let o2_minus_time = today_date.getTime() - o2_time_st_date.getTime()
            // bp time check
            let bp_time_st_date = new Date(`${bp_tim2_st}`)
            let bp_minus_time = today_date.getTime() - bp_time_st_date.getTime()


            if (mode == 0){ stack_now = stack_now + 800 }
            else { stack_now = stack_now + 500 }
            while (stack_now >= 500){
                // 20 min detect
                if (bp_minus_time > 1200000){
                    this.state.listData[idx].dv_data[blood_sys_dv_idx].push("-")
                    this.state.listData[idx].dv_data[blood_dia_dv_idx].push("-")
                } else {
                    this.state.listData[idx].dv_data[blood_sys_dv_idx].push(blood_sys)
                    this.state.listData[idx].dv_data[blood_dia_dv_idx].push(blood_dia)
                }

                // 20 min detect
                if (o2_minus_time > 1200000){
                    this.state.listData[idx].dv_data[o2_dv_idx].push("-")
                    this.state.listData[idx].dv_data[hr_dv_idx].push("-")
                    this.state.listData[idx].dv_data[o2_pulse_idx].push("-")
                } else {
                    this.state.listData[idx].dv_data[o2_dv_idx].push(o2_dv)
                    this.state.listData[idx].dv_data[hr_dv_idx].push(hr_dv)
                    this.state.listData[idx].dv_data[o2_pulse_idx].push(o2_pulse)
                }

                stack_now = stack_now - 500
            }
            this.state.listData[idx].stack_dv = stack_now
        }

        this._pushDataToListData = (trid, devType_id, dev_id, time_st, chart_data, req, chart_no, mode) => {
            let idx = this._idxInListData(req)
            let is_push_empty = false
            // time check
            let today_date = new Date()
            let time_st_date = new Date(`${time_st}`)
            let minus_time = today_date.getTime() - time_st_date.getTime()

            let length_add = 500
            // mode 0 is 800 sample mode (only lead 2)
            if (mode == 0){
                length_add = 800
            }
            //console.log(`length add : ${length_add}`)
            // tr id is equal
            if (this.state.listData[idx].data[chart_no].TrId == trid){
                //console.log(`same trid`)
                is_push_empty = true
            }
            // time over 20 min
            if (minus_time > 1200000){
                //console.log(`time > 5 min : ${minus_time}`)
                is_push_empty = true
            }
            // check assign data
            if (this.state.listData[idx].data[chart_no].TrId == -1){
                this.state.listData[idx].data[chart_no].TrId = trid
                this.state.listData[idx].data[chart_no].DevTypeID = devType_id
                this.state.listData[idx].data[chart_no].DevID = dev_id
            }
            else if (this.state.listData[idx].data[chart_no].TrId != trid){
                this.state.listData[idx].data[chart_no].TrId = trid
            }

            // push 
            let list_for_update = []
            let is_push_data = true
            //
            if (is_push_empty){
                // build empty for push
                if (mode == 1){
                    for (let i = 0; i < length_add; i++){
                        list_for_update.push(-1)
                    }
                }else{
                    is_push_data = false
                }
            }
            //
            else{
                list_for_update = [...chart_data]
            }

            if (is_push_data == true) {
                // assign mode of list req
                this.state.listData[idx].mode_now = mode
                // assign list data 
                this.state.listData[idx].data[chart_no].chart_value = this.state.listData[idx].data[chart_no].chart_value.concat(list_for_update)
            }

            return is_push_data
        }

        this._isGoToMainScreen = () => {
            if (this.state.is_success_load_first_time == false){
                // first time download is done here
                // if the req data is zero
                this.state.is_success_load_first_time = true
            }
        }

        this._isfirststate = () => {
            is_render = false;
            this._reloadReq()

            this.state.timer_2 = setTimeout(() => this._issecondstate(), 250);
            this.state.timer_3 = setTimeout(() => this._isGoToMainScreen(), 5000)
            this.setState(
                {
                    data_show_chart: [],
                }
            );
        }

        this._issecondstate = () => {
            is_render = true
            this.setState(
                {
                    data_show_chart: this._fetchnewStatedata(),
                }
            );
            this.state.timer_1 = setTimeout(() => this._isfirststate(), 5250)
		}
		
		///////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////     FOR RENDER     //////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////

        this._renderDigitalValue = (index_dv) => {
            let dv = this.state.data_show_dv[index_dv]
            if (dv == 0){
                return "-"
            }
            else if (dv == -2){
                // wait signal
                return "-"
            }
            else{
                return dv
            }
        }

        this._rendergraph = (req, chart_no, width_size = '100%', size = 120) => {
            if (is_render == true) {
                let idx_req = this._idxInShowChartListData(req)
                let chart_num = [...this.state.data_show_chart[idx_req].data[chart_no]]
                let first_value_data = chart_num[0].value_data
                // let data_for_log = ''
                // let num_data_log = chart_num.length
                // if (num_data_log > 10) {num_data_log = 10}
                // for (let i = 0; i < num_data_log; i++){
                //     data_for_log =`${data_for_log},${chart_num[i].value_data}`
                // }
                // console.log(`data : ${data_for_log}`)
                let half_size = size/2
                let one_four_size = half_size/2
                if (first_value_data == -2){
                    return(
                        <Row
                            style={{
                                height: size,
                                textAlign: "center",
                            }}
                        >
                            <Row style={{height: one_four_size}}></Row>
                            <Row 
                                style={{
                                    height: half_size,
                                    textAlign: "center",
                                    color:'#00FF00'
                                }}
                            >
                                <ScaleText maxFontSize={30}>รอสัญญาณ...</ScaleText>
                            </Row>
                            <Row style={{height: one_four_size}}></Row>
                        </Row>
                    )
                }
                else if (first_value_data == -1){
                    return(
                        <Row
                            style={{
                                height: size,
                                textAlign: "center",
                            }}
                        >
                            <Row style={{height: one_four_size}}></Row>
                            <Row 
                                style={{
                                    height: half_size,
                                    textAlign: "center",
                                    color:'#00FF00'
                                }}
                            >
                                <ScaleText maxFontSize={30}>ไม่มีข้อมูล...</ScaleText>
                            </Row>
                            <Row style={{height: one_four_size}}></Row>
                        </Row>
                    )
                }
                return (
                    <ResponsiveContainer key={1} width={width_size} height={size}>
                        <LineChart data={chart_num}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            {/* <CartesianGrid horizontalPoints={[50]} /> */}
                            <YAxis domain={[0, 200]} hide={true}/>
                            <XAxis tick={false} />
                            <Line type="monotone" dataKey='value_data' stroke="	#00FF00"     dot={false}
                                animationBegin={0}
                                animationDuration={5000}
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

        this._buttonForTrigPopup = (req) => {
            let idx = this._idxInListData(req)
            let mode_now = this.state.listData[idx].mode_now
            let delayed = this.state.listData[idx].delay
            if (mode_now == 1 && delayed == true) {
                return (
                    <center><b>
                        <Button
                            type="primary" ghost
                            style={{
                                flex: 1,
                                width: '80%'
                            }}
                        >
                            {`โหมด 12 Lead`}
                        </Button></b></center>
                )
            } else {
                return(
                    <center><b>
                        <Button
                            type="primary" disabled
                            style={{
                                flex: 1,
                                width: '80%'
                            }}
                        >
                            {`โหมด 12 Lead`}
                        </Button></b></center>
                )
            }
        }

        this._buttonForTrigMap = (req, id_box) => {
            return(
                <center><b>
                    <Button
                        type="primary" ghost
                        style={{
                            flex: 1,
                            width: '80%'
                        }}
                        onClick={this._onClickOpenMap(req, id_box)}
                    >
                        {`แผนที่`}
                    </Button>
                </b></center>
            )
        }

        this._renderButtonPopup = (req) => {
            return (
                
            <Popup
                trigger={this._buttonForTrigPopup(req)}
                modal
                closeOnDocumentClick
                closeOnEscape
            >
                <div
                    style={{
                        fontSize: 24,
                        width: '100%',
                        padding: '15px 15px 20px 30px',
                        background: '#000'
                    }}>
                    
                    <Row 
                        style={{
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifySelf: 'center',
                            marginTop: '2px',
                            background: '#000',
                            color:'#fff'
                        }} 
                    >
                        <Row>
                            <Col span={8}>
                                {`Lead I`}
                                {this._rendergraph(req, 0)}
                            </Col>
                            <Col span={8}>
                                {`Lead II`}
                                {this._rendergraph(req, 1)}
                            </Col>
                            <Col span={8}>
                                {`Lead III`}
                                {this._rendergraph(req, 2)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                {`aVR`}
                                {this._rendergraph(req, 3)}
                            </Col>
                            <Col span={8}>
                                {`aVL`}
                                {this._rendergraph(req, 4)}
                            </Col>
                            <Col span={8}>
                                {`aVF`}
                                {this._rendergraph(req, 5)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                {`V1`}
                                {this._rendergraph(req, 6)}
                            </Col>
                            <Col span={8}>
                                {`V2`}
                                {this._rendergraph(req, 7)}
                            </Col>
                            <Col span={8}>
                                {`V3`}
                                {this._rendergraph(req, 8)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                {`V4`}
                                {this._rendergraph(req, 9)}
                            </Col>
                            <Col span={8}>
                                {`V5`}
                                {this._rendergraph(req, 10)}
                            </Col>
                            <Col span={8}>
                                {`V6`}
                                {this._rendergraph(req, 11)}
                            </Col>
                        </Row>
                    </Row>
                </div>
            </Popup>);
		}

        this._renderDynamicReqBox = () => {
            var data_source = this.state.req_data_list
            if (data_source.length > 0){
                var boxList = data_source.map(dat_some => (
                    <Layout
                        key={dat_some.id}
                        style={{
                            height: '315px',
                            width: '100vw',
                            alignItems: 'center',
                            justifySelf: 'center',
                            padding: '20px 10px 10px 10px',
                            //backgroundColor:'rgb(48,66,90)',

                            //-- add here --
                            backgroundColor:'rgb(146,226,232)'
                            //--------------
                        }}
                        
                    >
                        <Row
                            style={{
                                //fix-here
                                //edit height = 50%
                                //height: '100%',
                                maxHeight: '100%',
                                width: '95%',
                                backgroundColor: 'white',
                                borderStyle: 'solid',
                                borderRadius: '10px',
                                borderWidth: '1px',
                                borderColor: '#A8A8A8',
                                alignItems: 'center',
                                justifySelf: 'center',
                                padding: '10px',
                            }}
                        >
                            <Col span={6}>
                                <Row>
                                    <center><ScaleText maxFontSize={30}>{`${dat_some.title_show}`}</ScaleText></center>  
                                </Row>
                                <Row style={{textAlign: "justify", margin: '10px 10% 2px 10%'}}>
                                    {`${dat_some.description_show.split(',')[0]}`}
                                </Row>
                                <Row style={{textAlign: "justify", margin: '2px 10% 2px 10%'}}>
                                    {`${dat_some.description_show.split(',')[1]}`}
                                </Row>
                                <Row style={{textAlign: "justify", margin: '2px 10% 10px 10%'}}>
                                    {`${dat_some.description_show.split(',')[2]}`}
                                </Row>
                                <Row>
                                    {this._renderButtonPopup(dat_some.value)}
                                </Row>
                                <Row style={{height:'1vh'}}></Row>
                                <Row>
                                    {this._buttonForTrigMap(dat_some.value, dat_some.id)}
                                </Row>
                            </Col>
                            
                            <Col span={18}>
                                <Row
                                    style={{
                                        height:'50%',
                                        width:'100%', 
                                        padding:'2px 2px 2px 2px',                                 
                                    }}
                                >
                                    <Col 
                                        style={{
                                            backgroundColor: 'white',
                                            borderStyle: 'solid',
                                            borderRadius: '10px',
                                            borderWidth: '1px',
                                            borderColor: '#A8A8A8',
                                            alignItems: 'center',
                                            justifySelf: 'center',
                                            marginTop: '2px',
                                            background: '#000',
                                            color:'#fff'
                                        }} 
                                        span={24}
                                    >
                                        <Row>
                                            <div><center>Lead II</center></div>
                                            {this._rendergraph(dat_some.value, 1)}
                                        </Row>
                                    </Col>
                                </Row>
                                <Row
                                    style={{
                                        height:'50%',
                                        width:'100%', 
                                        padding:'2px 2px 2px 2px',                            
                                    }}
                                >
                                    <Col span={4}
                                        style={{
                                            height: '100%',
                                            backgroundColor: 'white',
                                            borderStyle: 'solid',
                                            borderRadius: '10px',
                                            borderWidth: '1px',
                                            borderColor: '#A8A8A8',
                                            alignItems: 'center',
                                            justifySelf: 'center',
                                            padding: '10px',
                                            background: '#000',
                                            color:'#FFF'
                                        }}
                                    >
                                        <div>O2Sat</div>
                                        <center><div style={{
                                            alignItems: 'center',
                                            fontSize: 42,
                                            color:'#00FF00'
                                        }}>
                                            {this._renderDigitalValue(o2_dv_idx)}
                                        </div> 
                                        </center>
                                    </Col>
                                    <Col span={4} offset={1}
                                        style={{
                                            height: '100%',
                                            backgroundColor: 'white',
                                            borderStyle: 'solid',
                                            borderRadius: '10px',
                                            borderWidth: '1px',
                                            borderColor: '#A8A8A8',
                                            alignItems: 'center',
                                            justifySelf: 'center',
                                            padding: '10px',
                                            background: '#000',
                                            color:'#FFF'
                                        }}
                                    >
                                        <div>Heart Rate</div>
                                        <center><div style={{
                                            alignItems: 'center',
                                            fontSize: 42,
                                            color:'#00FF00'
                                        }}>
                                            {this._renderDigitalValue(hr_dv_idx)}
                                        </div> 
                                        </center>
                                    </Col>
                                    <Col span={4} offset={1}
                                        style={{
                                            height: '100%',
                                            backgroundColor: 'white',
                                            borderStyle: 'solid',
                                            borderRadius: '10px',
                                            borderWidth: '1px',
                                            borderColor: '#A8A8A8',
                                            alignItems: 'center',
                                            justifySelf: 'center',
                                            padding: '10px',
                                            background: '#000',
                                            color:'#FFF'
                                        }}
                                    >
                                        <div>SYS</div>
                                        <center><div style={{
                                            alignItems: 'center',
                                            fontSize: 42,
                                            color:'#00FF00'
                                        }}>
                                            {this._renderDigitalValue(blood_sys_dv_idx)}
                                        </div> 
                                        </center>
                                    </Col>
                                    <Col span={4} offset={1}
                                        style={{
                                            height: '100%',
                                            backgroundColor: 'white',
                                            borderStyle: 'solid',
                                            borderRadius: '10px',
                                            borderWidth: '1px',
                                            borderColor: '#A8A8A8',
                                            alignItems: 'center',
                                            justifySelf: 'center',
                                            padding: '10px',
                                            background: '#000',
                                            color:'#FFF'
                                        }}
                                    >
                                    <div>DIA</div>
                                        <center><div style={{
                                            alignItems: 'center',
                                            fontSize: 42,
                                            color:'#00FF00'
                                        }}>
                                            {this._renderDigitalValue(blood_dia_dv_idx)}
                                        </div> 
                                        </center>
                                    </Col>
                                    <Col span={4} offset={1}
                                        style={{
                                            height: '100%',
                                            backgroundColor: 'white',
                                            borderStyle: 'solid',
                                            borderRadius: '10px',
                                            borderWidth: '1px',
                                            borderColor: '#A8A8A8',
                                            alignItems: 'center',
                                            justifySelf: 'center',
                                            padding: '10px',
                                            background: '#000',
                                            color:'#FFF'
                                        }}
                                    >
                                    <div>O2 PULSE</div>
                                        <center><div style={{
                                            alignItems: 'center',
                                            fontSize: 42,
                                            color:'#00FF00'
                                        }}>
                                            {this._renderDigitalValue(o2_pulse_idx)}
                                        </div> 
                                        </center>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Layout>
                ))

                return (
                    <Layout>
                        {boxList}
                    </Layout>
                )
            }
        }

		this._renderAmbulanceMarker = (req_data_list, index) => {
            if (this.state.id_now == req_data_list.id)
            {
                return(
                    <Marker key={`marker-${index}`} latitude={req_data_list.lat_c} longitude={req_data_list.lng_c}>
                        <MarkerPin size={30} stat_pin={req_data_list.p_color_c} pin_id={req_data_list.title_c} pin_info={req_data_list.description_c} />
                    </Marker>
                );
            }
		}
		
		this._renderPatientMarker = (req_data_list, index) => {
            if (this.state.id_now == req_data_list.id)
            {
                return(
                    <Marker key={`marker-${index}`} latitude={req_data_list.lat_p} longitude={req_data_list.lng_p}>
                        <MarkerPin size={30} stat_pin={req_data_list.p_color_p} pin_id={req_data_list.title_p} pin_info={req_data_list.description_p} />
                    </Marker>
                );
            }
        }
        
        this._dataForRenderMap = () => {
            let idx = this.state.req_idx_now
            if (idx != -1){
                return this.state.req_data_list[idx]
            }
        }

        this._renderLoadingScreen = () => {
            if (this.state.is_success_load_first_time == false){
                // return loading screen
                return (
                    <div
                        style={{
                            height:'100vh', 
                            width:'100vw', 
                            backgroundColor:'rgb(146,226,232)',
                            //background:'linear-gradient(90deg, rgba(200,200,200,1) 40%, rgba(256,256,256,1) 100%)',
                            position:'absolute',
                            zIndex:15,
                        }}>
                    >
                        <Row style={{height:'30vh'}}></Row>
                        <Row type={'flex'} justify={'center'} style={{height:'30vh'}}>
                            <Col span={16} style={{
                                height:'30vh', 
                                textAlign:'center',
                                zIndex:20
                            }}>
                                <img
                                    src={Loadpage} 
                                    alt='' 
                                    width="100%"
                                    style={{
                                        maxHeight:'60vh'
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                )
            }
        }
		
		///////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////     EVENT HANDLER     ////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////

		this._onClickOpenMap = (req_id, id_box) => () => {
            let idx = this._idxInListData(req_id)
			// message.warning(`click req id: ${value}`)
			this.setState({
                id_now: id_box, 
				visibleMap: true,
                req_idx_now: idx, 
				req_id_now: req_id,
			})
		}

		this._onClickCloseReqModal = () => {
			this.setState({
				visibleMap: false,
			})
		}

        this._ChangeToLoginPage = () => {
            Router.push({
                pathname: '/index'
            })
        }

	}

	render(){
        //console.log(`render status:${this.state.is_success_load_first_time}`)
        if (this.state.is_success_load_first_time == false){
            return(
                <div
                    style={{
                        height:'100vh', 
                        width:'100vw', 
                    }}
                >
                    {this._renderLoadingScreen()}  
                </div> 
            )
        }

		return(
			<div
				style={{
					height:'100vh', 
					width:'100vw', 
				}}
            >                              
				<img
                    //-- add here --
                    src={HeaderImg} 
                    alt='' 
                    style={{width:'100%'}}
                    //------------ --
                />
                <Layout
					//style={{
					//	height:'20vh',
					//	width:'100vw',
					//	position:'absolute',
					//	zIndex:5,
					//	background:'linear-gradient(90deg, rgba(233,244,245,1) 0%, rgba(191,215,2,1) 100%)'
                    //}}
				>
				</Layout>
				<Row type={'flex'} justify={'center'} style={{height:'80vh'}}>
					{this._renderDynamicReqBox()}
				</Row>
				<Modal
                    width="87vw"
					title="ข้อมูลแผนที่"
					visible={this.state.visibleMap}
                    onOk={this._onClickCloseReqModal}
                    onCancel={this._onClickCloseReqModal}
					okText={"ปิด"}
                    cancelText={` `}
                    cancelButtonDisabled={true}
                    footer={null}
				> 
					<link href="https://api.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.css" rel="stylesheet" />       
					<ReactMapGL
                        mapStyle="mapbox://styles/mapbox/streets-v9"
                        // TOKEN is code map form mapbox-gl website which is created from user.
						mapboxApiAccessToken={TOKEN}
						onViewportChange={(viewport) => this.setState({viewport})}
						{...this.state.viewport}
					>
						{this.state.req_data_list.map(this._renderAmbulanceMarker)}
						{this.state.req_data_list.map(this._renderPatientMarker)}

						<div className="nav" style={navStyle}>
							<NavigationControl />
						</div>
					</ReactMapGL>
				</Modal>
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
			axios.get(apiGetMeURL, {
				withCredentials: true,
				headers: header 
			})       
			.then(res => {
                //console.log(res)
                console.log(`ready to start`)
                this.state.header_axios = {
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                    'Authorization': `Bearer ${this.state.token}`
                }
                this._isfirststate()
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
        clearInterval(this.state.interval);
        clearInterval(this.state.timer_1);
        clearInterval(this.state.timer_2);
        clearInterval(this.state.timer_3)
	}

}

export default MonitorPage
