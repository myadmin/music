(function () {

    var PlayMusic = function () {
        this.lyric = [];
        this.musicSrcs = ['https://api.pushemail.xyz/song/url?id=415792881'];
        this.lyricSrcs = ['https://api.pushemail.xyz/lyric?id=415792881'];
        this.lyricContent = document.querySelector('.lyric-content')

        this.init(0);
    }

    PlayMusic.prototype = {
        constructor: PlayMusic,
        init: function (index) {
            this.syncLyric();

            this.getLyric(index);

            this.getSong();
        },
        syncLyric: function () {
            var _this = this;
            document.querySelector('audio').ontimeupdate = function () {
                if (this.ended) {
                    _this.palyMusic(_this.songData);
                }

                if (_this.lyric != null) {
                    for (let i = 0; i < _this.lyric.length; i++) {
                        if (!isNaN(_this.lyric[i][0])) {
                            if (this.currentTime > _this.lyric[i][0] - 1) {
                                var line = document.getElementById('line-' + i),
                                    prevLine = document.getElementById('line-' + (i > 0 ? i - 1 : i));
                                prevLine.className = '';
                                line.className = 'current'
                                _this.lyricContent.style.transform = 'translateY('+ (130 - line.offsetTop) + 'px)';
                            }
                        }
                    }
                }
            }
        },
        getLyric: function (index) {
            var _this = this;
            this.getData(_this.lyricSrcs[index], function (lrc) {
                var lrcData = JSON.parse(lrc);
                if (lrcData.code === 200) {
                    var lrc = lrcData.lrc.lyric;
                    _this.lyric = _this.parseLyric(lrc);
                    _this.loadLyric(_this.lyric);

                    _this.getData(_this.musicSrcs[index], function (data) {
                        _this.songData = JSON.parse(data);
                        if (_this.songData.code === 200) {
                            _this.palyMusic(_this.songData.data[0].url);
                        } else {
                            alert('不存在该歌曲');
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
        palyMusic: function (songData) {
            var audio = document.querySelector('#audio');
            audio.setAttribute('src', songData);
        },
        parseLyric: function (lrc) {
            try {
                var lines = lrc.split('\n'),
                    pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
                    result = [];

                while(!pattern.test(lines[0])) {
                    lines = lines.slice(1);
                }

                lines[lines.length - 1].length === 0 && lines.pop();
                lines.forEach(function (ele, i, arr) {
                    var index = ele.indexOf(']')
                    var time = ele.substring(0, index+1),
                        value = ele.substring(index+1),
                        timeString = time.substring(1, time.length-2),
                        timeArr = timeString.split(':');

                    result.push([parseInt(timeArr[0], 10) * 60 + parseFloat(timeArr[1]), value]);
                });

                result.sort(function (a, b) {
                    return a[0] - b[0];
                });

                return result;

            } catch (e) {
                console.log(e);
                alert('没有歌词');
                return [];
            }
            
            
        },
        loadLyric: function (lyric) {
            try {
                this.lyricContent.innerHTML = '';
                var fragment = document.createDocumentFragment();
                lyric.forEach(function(v, i, a) {
                    var line = document.createElement('p');
                    line.id = 'line-' + i;
                    line.textContent = v[1];
                    fragment.appendChild(line);
                });

                this.lyricContent.appendChild(fragment);
            } catch (e) {
                console.log(e);

                return [];
            }
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
                    _this.musicSrcs.push('https://api.pushemail.xyz/song/url?id=' + songId);
                    _this.lyricSrcs.push('https://api.pushemail.xyz/lyric?id=' + songId);
                    _this.init(0);

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
