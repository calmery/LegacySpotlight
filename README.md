# Spotlight Beta
====

### Description
サイバーボランティアの活動の一環として開発した．Twitterの匿名性を利用した不正な利用を素早く見つけ出し報告、監視を目的としたアプリケーションの開発を行う．

### Future
機能の追加を短い期間で行う．ある一定以上の機能が追加されたとき、不具合の修正を行い安定版を公開する．安定版は不具合が確認されたり安定していない機能は全て除外され実装されない．

### Requirement
現在のバージョンにおいて以下の環境で動作の確認を行っている．この他の環境では正しく動作しない可能性がある．

- Windows 8
- Windows 10
- Mac OS X El Capitan

### Install
[Release](https://github.com/calmery/spotlight/releases) からダウンロードし，ファイルの書き込みが許可されているディレクトリ（デスクトップなど）に展開する．フォルダを開き Spotlight.exe また Spotlight.app を実行する．

### Development
[NodeJS v4.4.7 LTS](https://nodejs.org/en/) をインストール後 [npm](https://www.npmjs.com) を使いモジュールをインポートする． 

`$ npm install -g electron-prebuilt`  
package.json のあるディレクトリに移動し以下のコマンドを実行する．  
`$ npm install`  
その後以下のコマンドでアプリケーションを実行する．  
`$ electron .`

以下の方法でも実行可能．
`$ cd requirements`  
`$ sh install.sh`  
`$ sh run.sh`

electron-packager を使いアプリケーションとして書き出すことができる．  
`$ npm install -g electron-packager`  
`$ electron-packager . SpotlightBeta --platform=win32,darwin --arch=x64 --version=1.2.4`

### License
This software is released under the [GPL-2.0](https://opensource.org/licenses/GPL-2.0) License, see LICENSE.

### Author
patchworks
- [Marei Kikukawa](https://github.com/calmery)
- [Naoya Sugita](https://github.com/naoyasugita)
- [Keisuke Toyota](https://github.com/KeisukeToyota)

### Thanks
- [Luchesa. Vol. 9 Free | Just UI](https://www.iconfinder.com/icons/669950/electric_energy_idea_lamp_light_icon#size=512)
