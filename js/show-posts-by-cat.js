// 目前没有用

jQuery(function ($) {
    // 遍历每个 .cat-posts，按自己的 data-cat 去取文章
    $('.cat-posts').each(function () {
        const $box   = $(this);
        const catId  = $box.data('cat');

        $.post(ajax_object.ajax_url, {
            action: 'ajax_more_posts',
            catid : catId,
            start : 0,
            posts_per_page: 1,
        }).done(function (posts) {
            let html = '';
            posts.forEach((p, i) => {
                // 统一处理缩略图
                const img = p.thumbnail || ajax_object.placeholder;
                
                html += `
                    <a class="post-cat-name" href="${p.link}">
                        <strong>${p.cat_name}</strong>
                    </a>`;

                if (i === 0) {
                    // 首条：大图 + 标题
                    html += `
                    <div class="post-div grid-first">
                        <img src="${img}" alt="${p.title}">
                        <a href="${p.link}">${p.title}</a>
                    </div>`;
                } else {
                    // 其余：仅标题
                    html += `
                    <a class="grid-item grid-list" href="${p.link}">
                        <h3>${p.title}</h3>
                    </a>`;
                }
            }); 
            $box.html(html);
        });
    });



});