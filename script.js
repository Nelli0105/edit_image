$(document).ready(function(){

    let ctx = $('#myCanvas').get(0).getContext('2d')
    let url = 'https://api.picsart.com/photos/search.json?tag=pa_infinitescroll&fbclid=IwAR3L_SB9WpQYUf_c_ZhfMo6psqECAHfznlmpLS16Cpk__SpLro-TLG_2k7w'
    let canvas = $('#myCanvas')
    const canvas_left = canvas.get(0).getBoundingClientRect().left;
    const canvas_top = canvas.get(0).getBoundingClientRect().top;
    let image = {};
    let dx,dy,d_width,d_height,sx,sy,s_width,s_height
    let multiple;
    let resizable = {}
    let original_img;
    let original_img_width;
    let original_img_height;
    let diff_left;
    let diff_top;
    let crop_width;
    let crop_height;
    let current_x;
    let current_y;

    $.get(url, function (data) {

        for (let img of data.response)
        {
            let image = `<img class="current-img" id=${img.url} src="${img.url}" height= ${img.height}, width = ${img.width} crossOrigin = 'anonymous'>`
            $('.images-div').append(image)
        }
        $(`.current-img`).each(function () {

            $(this).on('click', function () {
                ctx.clearRect(0, 0, 1000, 1000);
                $('.resizable').remove()
                original_img = this
                origin_image_draw(this)
                $('.btn').css('display','none')
                $('.zoom').attr('min',parseInt(d_width))
                $('.zoom_lable').css('color','white')
                $('.crop_height_val').html('0')
                $('.crop_width_val').html('0')
            })
        })
    });


    function origin_image_draw(current_original_image) {
        original_img_width = parseFloat($(current_original_image).attr('width'));
        original_img_height = parseFloat($(current_original_image).attr('height'));
        if(original_img_height >= original_img_width)
        {
            dx = (1100-original_img_width*(650/original_img_height))/2
            dy = 100;
            d_width = original_img_width/(original_img_height/650);
            d_height = 650;
            multiple = original_img_height/650
        }
        else
        {
            dx = 150;
            dy = (850 - original_img_height*(800/original_img_width))/2;
            d_width = 800;
            d_height = original_img_height*(800/original_img_width);
            multiple = original_img_width/800
        }
        sx = 0;
        sy = 0;
        s_width = original_img_width;
        s_height = original_img_height;
        draw_in_canvas(current_original_image, sx,sy,s_width,s_height,dx,dy,d_width,d_height)
        $('.zoom').val(parseInt(d_width))
        crop_width = 0;
        crop_height = 0
        $('.crop_icon').prop('disabled', false)
        $('.zoom').prop('disabled', false)
    }


    function draw_in_canvas(current_img, sx,sy,s_width,s_height, dx,dy,d_width,d_height)
    {
        image.top = dy + canvas_top
        image.left = dx + canvas_left;
        image.bottom = image.top + d_height;
        image.right = image.left + d_width;
        ctx.clearRect(0,0,1100,1100)
        ctx.drawImage(current_img,sx,sy,s_width,s_height,dx,dy,d_width ,d_height)
        $('.drag_div').css({'height':d_height,'width':d_width,'top':image.top,'left':image.left})
        $('.crop_icon, .zoom_lable').css('display','block')
    }



//bottons
    crop_image()
    let crop_active = false
    let crop_butt_submited = false;
    function crop_image()
    {
        let resizable_div = `<div class='resizable'>
                <div class='resizers'>
         
                    <div class='resizer top-left'></div>
                    <div class='resizer top-right'></div>
                    <div class='resizer bottom-left'></div>
                    <div class='resizer bottom-right'></div>
                    
                    <table class="resizable_table">
                        <tr class="cubic">
                            <td></td><td></td><td></td>
                        </tr>
                        <tr class="cubic">
                            <td></td><td></td><td></td>
                        </tr>
                        <tr class="cubic">
                            <td></td><td></td><td></td>
                        </tr>
                    </table>
                </div>
            </div>`

        $('.crop_icon').click(function () {
            $(this).after(resizable_div)
            $('.crop_height_val').html(parseInt(d_height))
            $('.crop_width_val').html(parseInt(d_width))
            crop_width = d_width;
            crop_height = d_height
            $('.btn, .zoom_lable').css('display','block')
            $('.resizable').css({'width':d_width,'height':d_height,'top':image.top,'left':image.left})
            $('.resizable_table').css({'width':d_width,'height':d_height})
            $('.save_butt').css('display','none')
            resize()
            diff_left = $('.resizable').get(0).getBoundingClientRect().left - image.left;
            diff_top = $('.resizable').get(0).getBoundingClientRect().top - image.top;
            crop_butt_submited = true
            crop_active = true;
        })
    }


    $('.checked').click(function () {
        ctx.clearRect(0,0,1000,1000);
        diff_left = $('.resizable').get(0).getBoundingClientRect().left - image.left
        diff_top =  $('.resizable').get(0).getBoundingClientRect().top - image.top;
        crop_butt_submited = false
        $('.downoad_div').css('display','block')
        $('.save_butt, .cancel').css('display','block');
        $('.checked').css('display','none')


        if(image.top !== $('.resizable').get(0).getBoundingClientRect().top && crop_active === true)
        {
            cut_image(original_img)
        }
        else
        {
            origin_image_draw(original_img)
        }
        $('.resizable').remove()
        crop_active = false
    });


    $('.cancel').click(function ()
    {
        crop_butt_submited = false
        $('.resizable').remove();
        ctx.clearRect(0,0,1000,1000);
        origin_image_draw(original_img)
        $('.save_butt').css('display','none')
        $('.checked').css('display','none');
        crop_active = false;
    });


    $("#download").click(function ()
    {
        let hidden_canvas = `<canvas id="new_Canvas" height=${original_img_height} width=${original_img_width}></canvas>`;
        $('body').after(hidden_canvas)
        let new_ctx = $('#new_Canvas').get(0).getContext('2d');
        $('#new_Canvas').attr('width',crop_width*multiple)
        $('#new_Canvas').attr('height',crop_height*multiple)
        new_ctx.drawImage(original_img,diff_left*multiple,diff_top*multiple,crop_width*multiple,crop_height*multiple,0,0,crop_width*multiple,crop_height*multiple)
        let href = ($('#new_Canvas')[0]).toDataURL("image/png")
        $('#download').attr('href',href)
        $('.save_butt, .zoom_lable').css('display','none')

    });


    let last_width_px = $('.zoom').val()
    $('.zoom').on('input',function () {
        ctx.clearRect(0,0,1100,1100);
        let width_px = $(this).val()
        if (d_width > d_height)
        {
            let dx_zoom = dx - (width_px - 800)/2
            let dy_zoom = dy - (width_px - 800)/2

            if(last_width_px <= width_px)
            {
                draw_in_canvas(original_img,sx,sy,s_width,s_height,dx_zoom,dy_zoom,++d_width ,++d_height)
            }
            else
            {
                draw_in_canvas(original_img,sx,sy,s_width,s_height,dx_zoom,dy_zoom,--d_width ,--d_height)
            }
        }
        else
        {
            let dx_zoom  = dx - (width_px - original_img_width*650/original_img_height)/2
            let dy_zoom = dy - (width_px - original_img_width*650/original_img_height)/2
            if(last_width_px <= width_px )
            {
                draw_in_canvas(original_img,sx,sy,s_width,s_height,dx_zoom,dy_zoom,++d_width ,++d_height)
            }
            else
            {
                draw_in_canvas(original_img,sx,sy,s_width,s_height,dx_zoom,dy_zoom,--d_width ,--d_height)
            }
        }
        multiple = original_img_width/d_width;
        last_width_px = width_px;
        crop_active ? $('.btn').css('display','block'): $('.btn').css('display','none')
        $('.save_butt').css('display','none')
        $('.cancel').css('display','block')
    })



    function cut_image(current_image) {

        if(crop_height >= crop_width || (700 - crop_height*800/crop_width)<0)
        {
            dx = (1100 - crop_width/(crop_height/650))/2;
            dy = 100;
            d_width = crop_width/(crop_height/650);
            d_height = 650;
        }
        else
        {
            dx = 150;
            dy = (850 - crop_height*800/crop_width)/2;
            d_width = 800;
            d_height = crop_height*(800/crop_width);
        }

        sx = diff_left*(multiple)
        sy = diff_top*(multiple);
        s_width = crop_width*(multiple);
        s_height = crop_height*(multiple);
        draw_in_canvas(current_image,sx,sy,s_width,s_height,dx,dy,d_width,d_height)

    }



    function resize() {
        $('.bottom-right, .bottom-left, .top-right, .top-left').mousedown(function (event) {
            event.preventDefault();
            $(window).mousemove(resizing);
            $(window).mouseup(stopResize);

            function resizing(e) {
                if (event.target.classList.contains('bottom-right'))
                {
                    crop_width = e.pageX - $('.resizable').get(0).getBoundingClientRect().left;
                    crop_height = e.pageY - $('.resizable').get(0).getBoundingClientRect().top;
                    if (crop_width > 50 && e.pageX < image.right) {
                        $('.resizable, .resizable_table').css('width', crop_width)
                    }
                    if (crop_height > 50 && e.pageY <= image.bottom) {
                        $('.resizable, .resizable_table').css({'height': crop_height})
                    }
                    $('.crop_height_val').html(parseInt(crop_height))
                    $('.crop_width_val').html(parseInt(crop_width))
                }
                else if (event.target.classList.contains('top-left'))
                {
                    crop_width = $('.resizable').get(0).getBoundingClientRect().right - e.pageX;
                    crop_height = $('.resizable').get(0).getBoundingClientRect().bottom - e.pageY;
                    if (crop_width > 50 && e.pageX >= image.left)
                    {
                        $('.resizable').css({'width': crop_width, 'left': e.pageX})
                        $('.resizable_table').css({'width': crop_width})
                    }
                    if (crop_height > 50 && e.pageY >= image.top) {
                        $('.resizable').css({'height': crop_height, 'top': e.pageY})
                        $('.resizable_table').css({'height': crop_height})
                    }
                    $('.crop_height_val').html(parseInt(crop_height))
                    $('.crop_width_val').html(parseInt(crop_width))
                }
                else if (event.target.classList.contains('top-right'))
                {
                    crop_width = e.pageX - $('.resizable').get(0).getBoundingClientRect().left;
                    crop_height = $('.resizable').get(0).getBoundingClientRect().bottom - e.pageY;
                    if (crop_width > 50 && e.pageX <= image.right)
                    {
                        $('.resizable, .resizable_table').css({'width': crop_width})
                    }
                    if (crop_height > 50 && e.pageY >= image.top)
                    {
                        $('.resizable').css({'height': crop_height, 'top': e.pageY})
                        $('.resizable_table').css({'height': crop_height})
                    }
                    $('.crop_height_val').html(parseInt(crop_height))
                    $('.crop_width_val').html(parseInt(crop_width))
                }
                else {
                    crop_width = $('.resizable').get(0).getBoundingClientRect().right - e.pageX;
                    crop_height = e.pageY - $('.resizable').get(0).getBoundingClientRect().top;
                    if (crop_width > 50 && e.pageX >= image.left)
                    {
                        $('.resizable').css({'width': crop_width, 'left': e.pageX})
                        $('.resizable_table').css({'width': crop_width})
                    }
                    if (crop_height > 50 && e.pageY <= image.bottom)
                    {
                        $('.resizable, .resizable_table').css({'height': crop_height})
                    }
                    $('.crop_height_val').html(parseInt(crop_height))
                    $('.crop_width_val').html(parseInt(crop_width))
                }
            }
            function stopResize(e) {
                e.preventDefault();
                $(window).unbind('mousemove', resizing)
            }
        })

    }


    let start_x, start_y
    $('.drag_div').mousedown(function(e) {
        e.preventDefault()
        start_x = e.pageX;
        start_y = e.pageY
        $(this).css('cursor','pointer')
        $('.drag_div').mousemove(moving_img)
    })


    function moving_img(e)
    {

        crop_active ? $('.btn').css('display','block') :$('.btn').css('display','none')
        current_x = e.pageX - start_x + dx
        current_y = e.pageY - start_y + dy
        draw_in_canvas(original_img,sx,sy,s_width,s_height,current_x,current_y,d_width,d_height)
    }


    $('.drag_div').mouseup(function (e) {
        $(this).css('cursor','auto')
        if(e.pageX - start_x !== 0) {
            e.preventDefault()
            if (crop_butt_submited) {
                resizable.left = $('.resizable').get(0).getBoundingClientRect().left
                resizable.top = $('.resizable').get(0).getBoundingClientRect().top
                resizable.right = resizable.left + crop_width;
                resizable.bottom = resizable.top + crop_height
                if (image.top >= resizable.top) {
                    current_y = resizable.top - canvas_top
                }
                if (image.left >= resizable.left) {
                    current_x = resizable.left - canvas_left;
                }
                if (image.right <= resizable.right) {
                    current_x = current_x + resizable.right - image.right
                }
                if (image.bottom <= resizable.bottom) {
                    current_y = current_y + resizable.bottom - image.bottom
                }
                ctx.clearRect(0, 0, 1100, 1100)
                draw_in_canvas(original_img, sx, sy, s_width, s_height, current_x, current_y, d_width, d_height)
            }
            $('.drag_div').unbind('mousemove', moving_img)
        }
    })
});
