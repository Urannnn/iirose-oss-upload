## IIROSE-OSS-UPLOAD
iirose 平台专用图片上传工具，支持 **iirose / SCDN / 自定义 OSS** 三种图床模式切换。

原插件：[iirose-scdn-upload](https://github.com/Lezhengan/iirose-scdn-upload/blob/main/README.md)

按照原插件的 README 食用即可

在原插件的基础上增加了对象存储的选项，采用 **AWS4-HMAC-SHA256** 签名算法，兼容 S3 协议的对象存储服务。

另外添加了一个蓝色的右侧悬浮图标用于配置对象存储。

建议另外创建一个桶给图床本身用，上传的文件会按文件夹分类。

## OSS 配置说明

| 参数         | 说明     | 示例                                 |     |     |
| ---------- | ------ | ---------------------------------- | --- | --- |
| ENDPOINT   | API 端点 | `https://cn-xxx.rains3.com`        |     |     |
| DOMAIN     | 访问域名   | `https://iirose.cn-xxx.rains3.com` |     |     |
| ACCESS_KEY | 访问密钥   | 略                                  |     |     |
| SECRET_KEY | 安全访问密钥   | 略                                  |     |     |
| BUCKET     | 桶名称    | `iirose`                           |     |     |

![](https://iirose.cn-nb1.rains3.com/images/1780304761379_image.png)

## 兼容性

经测试雨云和腾讯云均可用

地区是自动读取 endpoint 得到的

腾讯云需要配置跨域规则(CORS)，如图：

![](https://iirose.cn-nb1.rains3.com/images/1780388647763_image.png)
