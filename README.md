# Spotlight

### Description
サイバーボランティアの活動の一環として開発した．これはTwitterの匿名性を利用した不正な利用を素早く見つけ出し報告，監視することを目的としたアプリケーションである．

### Requirement
- Windows 8
- Windows 10
- Mac OS X 10.11.6

### How to use
[Release](https://github.com/calmery/spotlight/releases) からダウンロードし，ファイルの書き込みが許可されているディレクトリに展開する．フォルダを開き Spotlight.exe また Spotlight.app を実行する．

### Development
- [NodeJS v4.4.7 LTS](https://nodejs.org/en/) 
- [npm](https://www.npmjs.com)

```
$ git clone https://github.com/calmery/Spotlight.git
$ cd spotlight
$ npm install -g electron-prebuilt  
$ npm install
$ electron .```
OR
```
$ git clone https://github.com/calmery/Spotlight.git
$ cd spotlight/requirements 
$ sh install.sh   
$ sh run.sh```

## Packaging
```
$ npm install -g electron-packager
$ electron-packager . SpotlightBeta --platform=win32,darwin --arch=x64 --version=1.2.4```

### License
This software is released under the [GPL-2.0](https://opensource.org/licenses/GPL-2.0) License, see LICENSE.

### Author
patchworks
- [Marei Kikukawa](https://github.com/calmery)
- [Naoya Sugita](https://github.com/naoyasugita)
- [Keisuke Toyota](https://github.com/KeisukeToyota)

### Thanks
- [Luchesa. Vol. 9 Free | Just UI](https://www.iconfinder.com/icons/669950/electric_energy_idea_lamp_light_icon#size=512)
