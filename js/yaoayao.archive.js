jQuery(document).ready(function ($) {
    var loading = false;
    var nomore = false;
    // 移除perPage变量，避免与后端冲突
    
    // 添加无更多内容提示元素
    var noMoreHtml = '<div class="no-more text-center py-4">已加载全部内容</div>';

    function loadPosts() {
        // 如果没有更多内容或正在加载中，直接返回
        if (nomore || loading) {
            return;
        }
        
        loading = true;
        $('.spinner').show();
        // 隐藏无更多提示（如果存在）
        $('.no-more').remove();

        let start = $('.post-div').length;
        
        // 构建请求参数对象，移除per_page参数
        let requestData = {
            action: 'ajax_more_posts',
            start: start,
            // posts_per_page: 5,
        };
        
        // 有分类ID时添加
        if (typeof gCatId !== 'undefined' && gCatId) {
            requestData.catid = gCatId;
        }

        // 保留标签和作者参数
        if (typeof gTagId !== 'undefined' && gTagId) {
            requestData.tagid = gTagId;
        }

        if (typeof gAuthorId !== 'undefined' && gAuthorId) {
            requestData.author = gAuthorId;
        }

        $.post("/wp-admin/admin-ajax.php", requestData, null, 'json')
            .done(function (posts, status) {
                // 恢复原始的posts处理方式
                if (!Array.isArray(posts)) {
                    posts = [];
                }

                // 恢复简单的nomore判断逻辑，但增加稳定性
                // 如果返回0篇，或连续两次返回少于5篇，则认为没有更多
                var currentLoadCount = posts.length;
                var previousLoadCount = parseInt(localStorage.getItem('previousLoadCount') || '5');
                
                nomore = currentLoadCount === 0 || 
                         (currentLoadCount < 5 && previousLoadCount < 5);
                
                // 保存当前加载数量供下次判断
                localStorage.setItem('previousLoadCount', currentLoadCount);

                let tabbox = $('.base-box');
                let content = '';

                // 文章HTML生成部分保持不变
                for (let i = 0; i < posts.length; i++) {
                    let post = posts[i];
                    let element = '';
                    if (post.thumbnail) {
                        element = '<div class="post-div simple-item simple-left-side slide-in">'
                        element += '<div class="simple-img simple-left-img">'
                        element += '<a class="simple-left-img-a" href="' + post.link + '" title="' + post.title + '">'
                        element += '<img alt="picture loss" src="' + post.thumbnail + '" />'
                        element += '</a>'
                        element += '<a class="simple-left-img-cat-a" href="' + post.cat_link + '" title="' + post.cat_name + '"><strong>' + post.cat_name + '</strong></a>'
                        element += '</div>'
                        element += '<div class="simple-content">'
                        element += '<h2>'

                        if (post.stick) {
                            element += '<strong>置顶</strong>'
                        }

                        element += '<a href="' + post.link + '" title="">' + post.title + '</a>'
                        element += '</h2>'
                        element += '<p>' + post.excerpt + '</p>'
                        element += '<p class="simple-info">'

                        if (post.author_avatar != '' || post.author_name != '') {
                            element += '<a href="' + post.author_link + '" title="' + post.author_name + '">'

                            if (post.author_avatar != '') {
                                element += post.author_avatar
                            }

                            if (post.author_name != '') {
                                element += '<em>' + post.author_name + '</em>'
                            }

                            element += '</a> · '
                        }

                        if (post.views_count != '') {
                            element += '<cite>浏览 ' + post.views_count + '</cite> · '
                        }

                        if (post.thumbup_count != '') {
                            element += '<cite>点赞 ' + post.thumbup_count + '</cite> · '
                        }

                        if (post.comment_count != '') {
                            element += '<cite>评论 ' + post.comment_count + '</cite> · '
                        }

                        element += '<cite>' + post.time + '</cite>'

                        element += '</p></div></div>'
                    } else {
                        element += '<div class="post-div simple-item slide-in">'
                        element += '<div class="simple-content">'
                        element += '<h2>'

                        if (post.stick) {
                            element += '<strong>置顶</strong>'
                        }

                        element += '<a href="' + post.link + '" title="">' + post.title + '</a>'
                        element += '</h2>'
                        element += '<p>' + post.excerpt + '</p>'
                        element += '<p class="simple-info">'

                        if (post.author_avatar != '' || post.author_name != '') {
                            element += '<a href="' + post.author_link + '" title="' + post.author_name + '">'

                            if (post.author_avatar != '') {
                                element += post.author_avatar
                            }

                            if (post.author_name != '') {
                                element += '<em>' + post.author_name + '</em>'
                            }

                            element += '</a> · '
                        }

                        if (post.views_count != '') {
                            element += '<cite>浏览 ' + post.views_count + '</cite> · '
                        }

                        if (post.thumbup_count != '') {
                            element += '<cite>点赞 ' + post.thumbup_count + '</cite> · '
                        }

                        if (post.comment_count != '') {
                            element += '<cite>评论 ' + post.comment_count + '</cite> · '
                        }

                        element += '<cite>' + post.time + '</cite>'

                        element += '</p></div></div>'
                    }

                    content += element;
                }

                tabbox.append(content);

                // 如果没有更多内容，显示提示并移除滚动监听
                if (nomore) {
                    tabbox.after(noMoreHtml);
                    $(window).off('scroll'); // 完全停止滚动加载
                }

                loading = false;
                $('.spinner').hide();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                // 更详细的错误信息
                loading = false;
                $('.spinner').hide();
                console.error('加载文章失败: ' + textStatus + ', 错误: ' + errorThrown);
            });
    }

    // 初始加载
    loadPosts();

    // // 滚动事件处理
    // var scrollTimeout;
    // $(window).scroll(function (event) {
    //     clearTimeout(scrollTimeout);
    //     scrollTimeout = setTimeout(function() {
    //         // 只有在还有更多内容且不在加载中时才触发
    //         if (!nomore && !loading && $(window).scrollTop() + $(window).height() + 200 > $(document).height()) {
    //             loadPosts();
    //         }
    //     }, 200);
    // });

});
    