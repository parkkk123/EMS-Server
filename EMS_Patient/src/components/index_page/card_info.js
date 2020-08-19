import react, { PureComponent } from "react";
import { Row, Col, Icon, Card} from 'antd'
import ScaleText from 'react-scale-text';

export default class CardInfo extends PureComponent{
    render(){
        const {lp_str, status_str} = this.props;

        return(
            <Card
                style={{
                    borderRadius:'10px',
                    boxShadow: '0px 0px 5px #888888',
                    borderColor: '#A8A8A8',
                    alignItems: 'center',
                    justifySelf: 'center',
                    verticalAlign: 'middle',
                    background: '#ffffff',
                }}
            >
                <Row style={{height:'5vh'}}>
                    <Col span={8}>
                        <Icon type="car" theme="twoTone" style={{fontSize: '16px'}}/>
                    </Col>
                    <Col span={16}>
                        <ScaleText minFontSize={10} maxFontSize={20}>{`${lp_str}`}</ScaleText>
                    </Col>
                </Row>
                <Row style={{height:'5vh'}}>
                    <Col span={8}>
                        <Icon type="check-circle" theme="twoTone" style={{fontSize: '16px'}}/>
                    </Col>
                    <Col span={16}>
                        <ScaleText minFontSize={10} maxFontSize={20}>{`${status_str}`}</ScaleText>
                    </Col>
                </Row>
            </Card>
        );
    }
}