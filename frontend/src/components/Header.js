import React, { Component } from 'react';

import { Layout, Button, Modal, Input, Radio, Upload } from 'antd';

import * as Utils from '../util/Utils';
import * as ipfsApi from '../api/ipfsApi';
import { post } from '../api/service';

class Header extends Component {

  constructor(props){
    super(props);
    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.onRadioChange = this.onRadioChange.bind(this);
    this.onTextareaChange = this.onTextareaChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  state = {
    modalVisible: false,
    confirmLoading: false,
    content: '',
    attachtype: 0,
    attachment: '',
  }

  postButton(){
    const { logged, user } = this.props;

    if(logged.name && user.account === logged.name){
      return (
        <Button
          shape='round'
          icon='edit'
          className='edit-btn'
          onClick={this.showModal}  
        >
          写微文
        </Button>
      );
    }
    return '';
  }

  showModal(){
    this.setState({modalVisible: true});
  }

  handleOk(){
    const { content, attachtype, attachment } = this.state;
    if(!content){
      Utils.msgError('内容不能为空');
      return;
    }
    if(attachtype && !attachment){
      Utils.msgError('附件不能为空');
      return;
    }

    this.setState({confirmLoading: true});

    post(content, attachtype, attachment, (res) => {
      if(res.transaction_id){
        Utils.msgTx(res.transaction_id);
        this.setState({
          modalVisible: false,
          confirmLoading: false,
          content: '',
          attachtype: 0,
          attachment: '',
        });
        window.location.reload();
      }else if(res.message){
        Utils.msgError(res.message);
        this.setState({
          modalVisible: false,
          confirmLoading: false,
        });
      }
    });
  }

  handleCancel(){
    this.setState({modalVisible: false});
  }

  async handleUpload(file){
    if (!file.type.startsWith('image/')) {
      Utils.msgError('只能上传图片');
      return false;
    }
    const hash = await ipfsApi.saveFileToIPFS(file);
    this.setState({attachment: hash});
    ipfsApi.pinByPinata(hash);
    return false;
  }

  signButton(){
    const { logged, user } = this.props;

    if((logged.name && user.account === logged.name && !Utils.isToday(user.last_reward_time))
      || (logged.name && user.account !== logged.name) ){ 

      return (
        <Button
          type='danger'
          className='sign-btn'
          onClick={this.props.reward}
        >
          签到领币  
        </Button>
      );
    }
    return '';
  }

  onRadioChange(e){
    this.setState({attachtype: e.target.value});
  }

  onInputChange(e){
    this.setState({attachment: e.target.value});
  }

  onTextareaChange(e){
    this.setState({content: e.target.value});
  }

  renderAttachment(type){
    if(type === 1 || type === 2){
      return <Input onChange={this.onInputChange} />
    }else if(type === 3){
      return (
        <Upload
          beforeUpload={this.handleUpload}
          showUploadList={false}
          accept='image/*'
        >               
        { 
          this.state.attachment 
            ? <img src={ipfsApi.ipfsUrl(this.state.attachment)} alt='' style={{width: 100, height: 100}}/> 
            : <Button type='primary' shape='round' icon='upload'>上传</Button>
        }
        </Upload>
      )
    }
    return '';
  }

  render(){
    const { modalVisible, confirmLoading, attachtype } = this.state;
    const { logged, login, logout } = this.props;

    return (
      <Layout.Header>
        <div>微文</div>
        <Modal
          title='写微文'
          visible={modalVisible}
          confirmLoading={confirmLoading}
          okText='提交'
          cancelText='取消'
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Input.TextArea 
            autosize={{ minRows: 8, maxRows: 15 }}
            onChange={this.onTextareaChange}  
          />
          <div className='modal-label'>附件类型：</div>
          <Radio.Group name='attachtype' defaultValue={0} onChange={this.onRadioChange}>
            <Radio value={0}>无</Radio>
            <Radio value={1}>链接</Radio>
            <Radio value={2}>IPFS哈希值</Radio>
            <Radio value={3}>图片</Radio>
            <Radio value={4}>视频</Radio>
            <Radio value={5}>其他文件</Radio>
          </Radio.Group>
          {attachtype ? <div className='modal-label'>附件：</div> : ''}
          {this.renderAttachment(attachtype)}
        </Modal>
        {this.postButton()}
        <Button
          type='primary'
          className='login-btn'
          onClick={logged.name ? logout: login }
        >
          {logged.name ? '注销' : '登录'}
        </Button>
        {this.signButton()}
      </Layout.Header>
    );
  }
}

export default Header;