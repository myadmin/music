(function () {

    var PlayMusic = function () {
        this.lyric = [];
        this.musicSrcs = ['https://api.pushemail.xyz/song/url?id=415792881'];
        this.lyricSrcs = ['https://api.pushemail.xyz/lyric?id=415792881'];
        this.musicDetail = ['https://api.pushemail.xyz/song/detail?ids=417859631'];
        this.lyricContent = document.querySelector('.lyric-content')

        this.init(0);
    }

    PlayMusic.prototype = {
        constructor: PlayMusic,
        init: function (index) {
            this.getLyric(index);

            this.getSong();
        },
        getLyric: function (index) {
            var _this = this;
            // 获取歌词
            this.getData(_this.lyricSrcs[index], function (lrc) {
                var lrcData = JSON.parse(lrc);
                if (lrcData.code === 200) {
                    _this.lyric = lrcData.lrc.lyric;

                    // 获取歌曲封面
                    _this.getData(_this.musicDetail[index], function (detail) {
                        _this.detail = JSON.parse(detail);
                        if (_this.detail.code === 200) {
                            let detail = _this.detail.songs[0];
                            // 获取歌曲
                            _this.getData(_this.musicSrcs[index], function (data) {
                                _this.songData = JSON.parse(data);
                                if (_this.songData.code === 200) {
                                    _this.palyMusic(detail, _this.songData.data[0].url, _this.lyric);
                                } else {
                                    alert('不存在该歌曲');
                                }
                            });
                        } else {

                        }
                    });

                    
                } else {
                    alert('没有歌词');
                }
            });
        },
        getData: function (url, callback) {
            //建立一个XMLHttpRequest请求
            var request = new XMLHttpRequest();
            //配置, url为歌词地址，比如：'./content/songs/foo.lrc'
            request.open('GET', url, true);
            //因为我们需要的歌词是纯文本形式的，所以设置返回类型为文本
            request.responseType = 'text';
            //一旦请求成功，但得到了想要的歌词了
            request.onload = function() {
                //这里获得歌词文件
                var lyric = request.response;

                callback && callback(lyric);
            };
            //向服务器发送请求
            request.send();
        },
        palyMusic: function (detail, songData, lrc) {
            const ap = new APlayer({
                container: document.getElementById('player'),
                mini: false,
                autoplay: true,
                loop: false,
                theme: '#FADFA3',
                preload: 'auto',
                volume: 0.7,
                mutex: true,
                listFolded: false,
                listMaxHeight: 90,
                lrcType: 1,
                audio: {
                    name: detail.name,
                    artist: detail.al.name,
                    url: songData,
                    cover: detail.al.picUrl,
                    lrc:  lrc,
                    theme: '#ebd0c2'
                }
            });
        },
        getSong: function () {
            var _this = this;
            var list = document.querySelectorAll('.list')[0];
            var fragment = document.createDocumentFragment();

            document.querySelector('#search').onkeypress = function (e) {
                if (e.charCode === 13) {
                    list.innerHTML = '';
                    _this.getData('https://api.pushemail.xyz/search?keywords=' + this.value, function (data) {
                        var songData = JSON.parse(data);
                        if (songData.code === 200) {
                            var songList = songData.result.songs;
                            songList.forEach(function (ele, index) {
                                var line = document.createElement('li');
                                line.className = 'list-li';
                                line.title = ele.name;
                                line.setAttribute('data-Id', ele.id);
                                line.textContent = ele.name;
                                fragment.appendChild(line);
                            });
    
                            list.appendChild(fragment);
                            list.style.height = '400px';
    
                            _this.clickFn();
                        }
                    });
                }
            };
        },
        clickFn: function () {
            var _this = this;
            var list = document.querySelectorAll('.list-li');
            var ul = document.querySelectorAll('.list')[0];
            var input = document.querySelector('#search');

            for (var i = 0; i < list.length; i++) {
                list[i].onclick = function (ev) {
                    ev.stopPropagation();
                    input.value = this.innerHTML;
                    var songId = this.getAttribute('data-id');
                    _this.musicSrcs.length = 0;
                    _this.lyricSrcs.length = 0;
                    _this.musicDetail.length = 0;
                    _this.musicSrcs.push('https://api.pushemail.xyz/song/url?id=' + songId);
                    _this.lyricSrcs.push('https://api.pushemail.xyz/lyric?id=' + songId);
                    _this.musicDetail.push('https://api.pushemail.xyz/song/detail?ids=' + songId);
                    _this.getLyric(0);
                    ul.style.display = 'none';
                };
            }

            input.onclick = function (ev) {
                ev.stopPropagation();
            };

            input.onfocus = function () {
                ul.style.display = 'block';
            };

            document.onclick = function () {
                ul.style.display = 'none';
            }

        }

    }

    new PlayMusic();

})();
