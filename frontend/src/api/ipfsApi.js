import IpfsAPI from 'ipfs-api';

const ipfs = IpfsAPI('ipfs.infura.io', '5001', {protocol: 'https'});
const ipfsPrefix = 'https://gateway.ipfs.io/ipfs/';

/**
 * 保存文件到IPFS
 */
export const saveFileToIPFS = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      const buffer = Buffer.from(reader.result);
      ipfs.add(buffer).then(res => {
        resolve(res[0].hash);
      }).catch(error => {
        console.log(error);
      });
    };
  });
};

/**
 * 保存文本到IPFS
 */
export const saveTextToIPFS = (text) => {
  return new Promise((resolve, reject) => {
    const descBuf = Buffer.from(text, 'utf-8');
    ipfs.add(descBuf).then(res => {
      resolve(res[0].hash);
    }).catch(error => {
      console.log(error);
    });
  });
};

/**
 * 从IPFS读取文本
 */
export const readTextFromIPFS = (hash) => {
  return new Promise((resolve, reject) => {
    ipfs.cat(hash).then(res => {
      let content = new TextDecoder('utf-8').decode(res);
      resolve(content);
    }).catch(error => {
      console.log(error);
    });
  });
};

/**
 * 通过哈希值访问IPFS上的文件 
 */
export const ipfsUrl = (hash) => {
  return ipfsPrefix + hash;
};