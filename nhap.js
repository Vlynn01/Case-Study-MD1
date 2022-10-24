//gọi id của thẻ canvas bên HTML
const cvs = document.getElementById("myCanvas");
//định dạng hình vẽ 2d
const ctx = cvs.getContext("2d");


//tạo biến khung hình
//khi trò chơi bắt đầu khung hình được đặt thành 0
//tạo tọa độ cho chim
let frames = 0
//tạo hằng tính tọa độ
const DEGREE = Math.PI / 180;

// load đồ họa & hình ảnh //cần
//một hình ảnh tổng quát
const sprite = new Image();
sprite.src = "img/sprite.png";

//audio
// load âm thanh
//gọi hằng âm thanh
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

//gamestate
//trong trò chơi có 3 trạng thái
//người chơi nhấp vào sẽ chuyển trạng thái
const state = {
    //thêm thuộc tính current để theo dõi từ đầu đến cuối
    current: 0, //chuyển trạng thái hiện tại
    getReady: 0, //từ 0 lên 1 khi tap vào vị trí bất kì
    game: 1, //nếu ở trạng thái trò chơi  nếu tap sẽ không nhận trạng thái, nếu thua sẽ qua trạng thái tiếp theo
    over: 2, //nếu nhấp vào nút tạo thì sễ quay lại trạng thái 0
}
//tạo nút bấm start
const startBtn = {
    //tọa độ nút bấm start
    x: 200, y: 263, w: 83, h: 29
}

//control the game
//thêm trình xử lý sự kiện vào canvas chứ không phải document
//vào hàm console kiểm tra xem state.current có chuyển đổi trạng thái tiếp theo hay không
cvs.addEventListener("click", function (evt) {
//ở đây tôi sử dụng câu lệnh switch để mỗi khi nhập vào sẽ kiểm tra trạng thái là gì
    //điều khiển trạng thái của trò chơi
    switch (state.current) {
        //trạng thái hiện tại là gameReady khi tap vào màn hình sẽ chuyển trạng thái sang màn hình trò chơi
        case state.getReady:
            state.current = state.game;
            //để âm thanh ở đây khi bắt đầu
            SWOOSHING.play();
            break;
        //để giữ nguyên trạng thái khi chạm vào ở màn hình trò chơi ta cần tạo hàm bird.flap()
        //chuyển trạng thái tiếp khi chim va chạm
        case state.game:
            bird.flap();
            //đặt âm thanh vẫy cánh khi ở trong màn hình game
            FLAP.play();
            break;
        //chuyển trạng thái về ban đầu khi ấn nút được tạo
        case state.over:
            //đưa trực tiếp nút bấm vào trong canvas
            let rect = cvs.getBoundingClientRect()
            //khi lăn con trỏ chuột lên xuống trang thì nút start không bị mất tọa độ click
            //clientX, Y trả về gốc tọa độ
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
            //vị trí nhấp chuột bây giờ sẽ thêm câu lệnh if, người chơi phải click đúng nút start
            //khi bấm vào nút start sẽ đặt lại ống, chim và điểm số và quay trở lại trạng thái getReady của game
            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY < startBtn.y + startBtn.h) {
                pipes.reset()
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
                break;
            }


    }

    //nút start và điều chỉnh chạm vào nút khi di chuyển trang

});
//background
//cắt ảnh, xem tọa độ ảnh bằng Brackets
//đối tượng
const bg = {
    //thuộc tính
    sX: 0, sY: 0, w: 275, h: 226, x: 0, y: cvs.height - 226, //hàm cắt ảnh bg sprite
    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h) //sử dụng phương pháp vẽ hình ảnh
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h) // cộng thêm chiều rộng vào trục x để cho hình nền đẩy đủ

    }
}

//foreground
const fg = {
    sX: 276, sY: 0, w: 224, h: 112, x: 0, y: cvs.height - 112, //thuộc tính dx để chỉnh tốc độ nền
    //detalX
    dx: 2, draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h) //sử dụng phương pháp vẽ hình ảnh
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h) // cộng thêm chiều rộng vào trục x để cho hình nền đẩy đủ
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w * 2, this.y, this.w, this.h) // cộng thêm chiều rộng vào trục x để cho hình nền đẩy đủ
    }, update: function () {
        if (state.current == state.game) {
            //di chuyển nền dưới cần trừ đi tọa độ x
            //trừ đi x sẽ lùi lại sang trái
            //this x = (0-2) % (224/2)
            //nếu không chia một nửa chiều rộng thì khung hình sẽ bị mất khi chạy
            this.x = (this.x - this.dx) % (this.w / 4); //chạy từ 2%112 đến 112%112= 0 thì quay lại tọa độ x
            // this.x = 0 //chạy từ 2%112 đến 112%112= 0 thì quay lại tọa độ x
        }


    }
}

//bird
//đối tượng con chim
const bird = {

    //tạo mảmg animation để tạo hoạt cảnh //4 hoạt cảnh
    animation: [{sX: 276, sY: 112}, //hoạt cánh cánh vẫy cánh lên
        {sX: 276, sY: 139}, //hoạt cánh cánh ở giữa
        {sX: 276, sY: 164}, //hoạt cảnh cánh vẫy xuống
        {sX: 276, sY: 139}, //hoạt cảnh cánh ở giữa
    ], x: 50, y: 150, w: 34, h: 26,

    //tạo bán kính cho chim để phát hiện va chạm
    radius: 12, //tạo khung hình cho chim vẫy cánh
    //khi hình ảnh chim xuất hiện khung hình được đặt thành 0
    frame: 0,

    //trọng lực
    gravity: 0.1, //nhảy
    jump: 3.5, //tốc độ
    speed: 0, //tọa độ la bàn
    rotation: 0,

    //tạo chức năng cập nhật cho nó

    draw: function () {
        //cập nhật sẽ chỉ cập nhật frame trạng thái
        //vì vậy tôi chỉ thay đổi frame này để làm cho con chim vỗ cánh
        let bird = this.animation[this.frame];
        //tạo save trong phương pháp vẽ
        ctx.save();
        //tạo hàm dịch gốc tọa độ trạng thái của la bàn
        ctx.translate(this.x, this.y);
        //sau đó sẽ xoay la bàn
        ctx.rotate(this.rotation);
        //căn giữa con chim trừ đi một nửa chiều rộng và chiều cao đề lùi lại cho dễ chơi
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h); // sử dụng phương pháp vẽ hình ảnh và thay đổi tọa độ để tạo hoạt ảnh cho chim vẫy cánh
        //tạo hàm khôi phục trạng thái của la bàn;
        ctx.restore();
    }, flap: function () {
        //thêm mã cho phương pháp vỗ
        // tọa độ y giảm thì chim sẽ bay lên
        this.speed = -this.jump;


    }, update: function () {
        //thêm một phương thức cập nhật  để cho nó hoạt ảnh
        //truyền giá trị giai đoạn
        //nếu ở chim ở giai đoạn màn hình getReady thì sẽ bay chậm lại
        this.period = state.current == state.getReady ? 10 : 5; //? là if - else //khoảng thời gian khung hình thay đổi
        //chúng ta sẽ tăng một frame cho mỗi giai đoạn
        //vì vậy frame này += với khung hình kia để sang khung hình tiếp theo
        //0%4 =0, 1%4=1, 2%4=2, 3%4=3, 4%4=0;
        this.frame += frames % this.period == 0 ? 1 : 0; //? là if - else// khoảng thời gian khung hình thay đổi
        //chúng ta sẽ tăng frame lên từ 0 đến 4, sau đó lại về 0
        //frame % của 4 hoạt cảnh trong mảng
        this.frame = this.frame % this.animation.length; //=> 4

        //? là viết tắt của if else
        // if(state.current == state.getReady){
        //     this.period = 10;
        // }else{
        //     this.period = 5;
        // }
        //sử dụng if else
        if (state.current == state.getReady) {
            //nó không đi lên trên, không đi xuống dưới nên tôi sẽ chỉ giữ vị trí Y của con chim
            this.y = 150; //reset lại vị trí ban đầu khi gameOver
            //cập nhật con chim xoay lên xuống
            // con chim đang đứng thẳng
            this.rotation = 0 * DEGREE;
        } else {
            //tốc độ cân bằng với trọng lực
            //tốc độ rơi cũng sẽ tăng lên từ 0, 0.25,0.5,0.75,1
            //giả xử con chim của chúng ta vừa bay ra khỏi 2 ống ở trên mà gặp 2 ống bên dưới đáy thì tốc độ rơi nhanh là rất cần thiét
            this.speed += this.gravity;
            //khi vị trí Y của chim thay đổi sẽ theo speed tốc độ
            //vì vậy nếu ta tăng vị trí Y, hoặc nếu tốc độ là một số dương thì con chim sẽ rơi xuống
            //giảm Y bay lên, đồng nghĩa với giảm tốc độ khi bay lên
            this.y += this.speed;
            //kiểm tra xem đó có phải là một trò chơi không, nếu con chim chạm vào nền dưới
            //lấy căn lề hình nên dưới
            if (this.y + this.h / 2 >= cvs.height - fg.h) {
                //căn lề cho chim chạm xuống đất
                this.y = cvs.height - fg.h - this.h / 2;
                //chuyển trạng thái qua màn trò chơi
                if (state.current == state.game) {
                    state.current = state.over
                    //âm thanh thua cuộc khi chuyển trạng thái over
                    DIE.play();
                }
            }
            //nếu tốc độ đang tăng thì chim đang rơi
            if (this.speed >= this.jump) {
                //rơi sẽ cho chim quay xuống 90 độ
                this.rotation = 90 * DEGREE;
                //khi con chim chạm đất sẽ phải dừng vẫy cánh nên tôi sẽ cho con chim về khung hình 1
                this.frame = 1;
            } else {
                //ngược lại thì sẽ quay đầu lên
                this.rotation = -25 * DEGREE;
            }
        }
    }, speedReset: function () {
        this.speed = 0;
    }
}
//hình nền getReady

const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152, //chiều rộng chia 2 sẽ ra giữa màn hình - một nửa của trục x để hình nền getReady ra giữa
    x: cvs.width / 2 - 173 / 2,
    y: 80,
    draw: function () {
        //bản cập nhật state trạng thái cho đối tượng
        if (state.current == state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}
//hình nền gameOver
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 225 / 2, //chiều rộng chia 2 sẽ ra giữa màn hình - một nửa của trục x để hình nền gameOver ra giữa
    y: 90,
    draw: function () {
        //bản cập nhật state trạng thái cho đối tượng
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }

}

// const medal = {
//     sX: 312,
//     sY: 157,
//     w: 40,
//     h: 32
//     x: cvs.width / 2 - 225 / 2,
//     y:90,
//     draw: function (){
//     }
// }

//vẽ đường ống pipes
const pipes = {
    //tạo một mảng đối tượng
    position: [], //cắt ảnh ống trên có tọa độ
    top: {
        sX: 553, sY: 0
    }, //cắt ảnh ống dưới có tọa tộ
    bottom: {
        sX: 502, sY: 0
    }, //chiều rộng của ống
    w: 53, //chiều dài của ống
    h: 400, //khoảng cách để chim bay qua
    gap: 110, //trừ đi chiều cao của ống để phù hợp cho trò chơi
    maxYPos: -150, dx: 2,


    draw: function () {
        //sử dụng vòng lặp để lặp qua vị trí của từng phần tử trong mảng
        for (let i = 0; i < this.position.length; i++) {
            //tạo biến để không phải lặp lại //p
            let p = this.position[i];
            //đặt biến cột trên
            let topYPos = p.y;
            //tính toán đầu ống trên và vị trí dưới cùng và + thêm khoảng cách gap để chim bay qua ống
            let bottomYPos = p.y + this.h + this.gap;
            //khi trục x giảm sẽ làm cho 2 ống di chuyển sang trái
            //ống trên
            //p.x
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h)
            //ống dưới
            //p.x
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h)
        }
    },

    update: function () {
        //kiểm tra xem hiệm tại có phải trạng thái trò chơi hay không
        if (state.current !== state.game) return;
        //cứ mỗi 100 khung hình, sẽ thêm một vị trí mới trong mảng //cột
        if (frames % 120 == 0) {
            this.position.push({
                x: cvs.width, //nằm trong canvas
                //
                y: this.maxYPos * (Math.random() + 1)
            });
        }
        //sử dụng vòng lặp qua các phần tử trong mảng
        for (let i = 0; i < this.position.length; i++) {
            //sau đó tạo một lần nữa biến p
            let p = this.position[i];


            //đầu tiên sẽ tính toán đường ống dưới
            //tương đồng với ống trên chỉ cần thay đổi tọa độ y cho xuống dưới
            let bottomPipeYPos = p.y + this.h + this.gap; //vị trí tọa độ y của nó + chiều cao + khoảng cách để chui qua ống


            //phát hiện va chạm
            //ống trên
            //lấy bán kính để tính va chạm
            //4 bán kính tương tương với 4 góc của con chim
            //bán kính con chim lớn hơn trục ngang thì là va chạm //+ độ rộng của cột là chỉ va chạm của đuôi trong phạm vi của cột
            //bán kính con chim lớn hơn trục dọc thì là va chạm //+ độ rộng của cột là chỉ va chạm của đuôi trong phạm vi của cột
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                state.current = state.over;
                HIT.play();
            }

            //ống dưới
            //lấy bán kính để tính va chạm
            //4 bán kính tương tương với 4 góc của con chim
            //bán kính con chim lớn hơn trục ngang thì là va chạm //+ độ rộng của cột là chỉ va chạm của đuôi trong phạm vi của cột
            //bán kính con chim lớn hơn trục dọc thì là va chạm //+ độ rộng của cột là chỉ va chạm của đuôi trong phạm vi của cột
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                state.current = state.over;
                HIT.play();
            }

            //nên đề cái này bên dưới vẽ đường ống thì mới phát hiện va chạm ống dưới
            //trừ dx thì cột và tọa độ x sẽ lùi sang trái
            p.x -= this.dx;

            //tạo thêm một điều kiện để xóa ống để tính điểm cho mỗi lần ống mất đi
            if (p.x + this.w <= 0) {
                this.position.shift();
                //mỗi khi ống mất đi sẽ cộng thêm một điểm
                score.value += 1;
                //âm thanh khi cộng điểm
                SCORE_S.play();
                //giá trị điểm lớn nhât
                score.best = Math.max(score.value, score.best);
                //gọi key lưu giá trị điểm lớn nhất
                localStorage.setItem("best", score.best);
            }
        }
    }, //đặt lại đường ống
    reset: function () {
        this.position = [];
    }
}

//score
//tính điểm và lưu điểm
const score = {
    //tạo điểm bằng số nguyên tạo đối tượng để lưu trữ dữ liệu
    //tạo key là best
    best: parseInt(localStorage.getItem("best")) || 0,  //sẽ không lưu giá trị khi điểm bằng 0
    value: 0, draw: function () {
        //vẽ điểm bằng màu trắng
        ctx.fillStyle = "#FFF";
        //viền chữ màu đen
        ctx.strokeStyle = "#000";

        //2 điều kiện khi ở trạng thái chơi game và trạng thái kết thúc game
        if (state.current == state.game) {
            //chiều rộng chữ = 2
            ctx.lineWidth = 2;
            //kiểu phông chữ Teko bằng 35px
            ctx.font = "35px Teko";
            //cho hình vẽ ra giữa màn hình
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50);
        } else if (state.current == state.over) {
            //score value
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 307, 186); //tọa độ hiển thị điểm số
            ctx.strokeText(this.value, 307, 186); //tọa độ viền đen của điểm số
            //best score
            ctx.fillText(this.best, 307, 228);
            ctx.strokeText(this.best, 307, 228);

        }
    }, reset: function () {
        this.value = 0
    }

}

//draw //cần
function draw() {
    ctx.fillStyle = "#73dffd"
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    //vẽ
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

//uplate //cần

function uplate() {
    //gọi hàm bird
    bird.update();
    fg.update();
    pipes.update();
}

//loop //cần
function loop() {
    //lặp lại hàm draw và uplate để tăng các khung hình
    uplate();
    draw();
    //theo dõi và tăng các khung hình có thể đặt thành frames=0; this.frame=0
    //kiểm tra xem frames%5 ==0 hay không? nếu đúng thì phải tăng this.frame+=1;

    frames++;
    //requestAnimationFrame để gọi vòng lặp
    requestAnimationFrame(loop);
}

loop();