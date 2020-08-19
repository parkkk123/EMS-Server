import React, {PureComponent} from 'react'
import 'antd/dist/antd.css';
import { Row, Layout, Spin, Col } from 'antd'
import Loadpage from './../img/Loading.gif';

export default class LoadingScreen extends PureComponent{
    render(){

        return(
            <Layout
                style={{
                    position:'absolute',
                    width:'100vw',
                    height:'100vh',
                    background:'rgba(146,226,232,1)',
                    zIndex:10
                }}
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
            </Layout>
        );
    }
}