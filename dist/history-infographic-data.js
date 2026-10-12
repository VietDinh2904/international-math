(()=>{
  "use strict";
  window.HistoryInfographicData={
    curriculum:{
      note:"Khung lớp 4–5 được đối chiếu với Chương trình GDPT 2018 và mục lục SGK Kết nối tri thức. Nội dung trong ứng dụng được viết lại ngắn gọn, không sao chép nguyên văn sách giải.",
      sources:[
        ["Chương trình GDPT môn Lịch sử và Địa lí cấp tiểu học","https://hoatieu.vn/bieu-mau/chuong-trinh-giao-duc-pho-thong-mon-lich-su-va-dia-ly-cap-tieu-hoc-1391"],
        ["Mục lục Lịch sử và Địa lí 5 · Kết nối tri thức","https://vietjack.com/lich-su-va-dia-li-5-kn/index.jsp"]
      ],
      grade4:[
        "Đền Hùng và lễ Giỗ Tổ Hùng Vương","Sông Hồng và văn minh sông Hồng","Thăng Long – Hà Nội","Văn Miếu – Quốc Tử Giám","Cố đô Huế","Phố cổ Hội An","Không gian cồng chiêng Tây Nguyên","Thành phố Hồ Chí Minh và Địa đạo Củ Chi"
      ],
      grade5:[
        {id:"van-lang-au-lac",label:"Văn Lang · Âu Lạc"},{id:"phu-nam",label:"Vương quốc Phù Nam"},{id:"champa",label:"Vương quốc Chăm-pa"},{id:"bac-thuoc",label:"Đấu tranh thời Bắc thuộc"},{id:"ly",label:"Triều Lý · Thăng Long"},{id:"tran",label:"Triều Trần · Mông–Nguyên"},{id:"lam-son",label:"Lam Sơn · Hậu Lê"},{id:"nguyen",label:"Triều Nguyễn"},{id:"august-1945",label:"Cách mạng tháng Tám 1945"},{id:"dien-bien-1954",label:"Điện Biên Phủ 1954"},{id:"hcm-1975",label:"Chiến dịch Hồ Chí Minh 1975"},{id:"doi-moi",label:"Đất nước Đổi mới"}
      ]
    },
    battles:{
      ngo:{name:"Chiến thắng Bạch Đằng",year:"938",place:"Sông Bạch Đằng",summary:"Ngô Quyền cho đóng cọc ngầm ở vùng cửa sông, nhử đoàn thuyền Nam Hán tiến vào khi nước triều lên và phản công khi nước rút.",steps:["Dự đoán hướng tiến quân theo đường biển và sông.","Bố trí bãi cọc, quân mai phục hai bờ.","Thuyền nhẹ ra khiêu chiến, nhử địch qua bãi cọc lúc nước lên.","Nước rút, quân ta phản công; thuyền địch va cọc và tan vỡ."],remember:"Chiến thắng chấm dứt thời kì Bắc thuộc kéo dài và mở ra thời đại độc lập, tự chủ.",source:"https://baotanglichsu.vn/vi/Articles/3098/13934/ngo-quyen-va-chienthang-bach-dang-nam-938.html",sourceLabel:"Bảo tàng Lịch sử Quốc gia · Bạch Đằng 938"},
      "tien-le":{name:"Kháng chiến chống Tống",year:"981",place:"Bạch Đằng · Chi Lăng",summary:"Lê Hoàn tổ chức lực lượng chống quân Tống trên cả đường thủy và đường bộ.",steps:["Chuẩn bị lực lượng và phòng tuyến.","Chặn đạo quân thủy ở vùng Bạch Đằng.","Đánh đạo quân bộ trên tuyến biên giới.","Buộc quân Tống rút lui."],remember:"Cuộc kháng chiến giữ vững nền độc lập của Đại Cồ Việt.",source:"https://baotanglichsu.vn/vi/Articles/2003/68034/le-djai-hanh-941-1005-vi-vua-djau-tien-cua-nha-tien-le.html",sourceLabel:"Bảo tàng Lịch sử Quốc gia · Lê Đại Hành"},
      ly:{name:"Phòng tuyến sông Như Nguyệt",year:"1077",place:"Sông Như Nguyệt",summary:"Lý Thường Kiệt xây dựng phòng tuyến bên bờ nam sông Như Nguyệt để chặn quân Tống.",steps:["Chủ động chuẩn bị từ trước.","Lập phòng tuyến dựa vào sông.","Giữ vững trận địa và làm suy yếu đối phương.","Chủ động giảng hòa khi đã bảo vệ được đất nước."],remember:"Địa hình sông ngòi được vận dụng linh hoạt trong phòng thủ.",source:"https://baotanglichsu.vn/vi/Articles/4081/trieu-ly-tran-1009-1400",sourceLabel:"Bảo tàng Lịch sử Quốc gia · Thời Lý–Trần"},
      tran:{name:"Chiến thắng Bạch Đằng",year:"1288",place:"Sông Bạch Đằng",summary:"Quân Trần bố trí bãi cọc, đánh đoàn thuyền lương và đoàn chiến thuyền Nguyên–Mông khi chúng rút lui.",steps:["Cắt nguồn lương của đối phương.","Bố trí bãi cọc và quân mai phục.","Nhử thuyền địch vào trận địa theo thủy triều.","Tổng phản công, kết thúc cuộc kháng chiến lần thứ ba."],remember:"Đây là đỉnh cao nghệ thuật thủy chiến thời Trần.",source:"https://baotanglichsu.vn/vi/Articles/2001/66582/djoi-djiem-so-luoc-ve-djot-khai-quat-bai-coc-bach-djang-xuan-1969.html",sourceLabel:"Bảo tàng Lịch sử Quốc gia · Bãi cọc Bạch Đằng"},
      "le-so":{name:"Chi Lăng – Xương Giang",year:"1427",place:"Lạng Sơn · Bắc Giang",summary:"Nghĩa quân Lam Sơn đánh các đạo viện binh, tạo điều kiện kết thúc cuộc khởi nghĩa.",steps:["Chọn địa hình hiểm yếu để phục kích.","Đánh tan lực lượng đi đầu tại Chi Lăng.","Tiếp tục chặn viện binh trên đường tiến xuống.","Bao vây Xương Giang, buộc quân Minh chấp nhận rút."],remember:"Thắng lợi đưa tới nền độc lập và sự ra đời của triều Lê sơ.",source:"https://baotanglichsu.vn/vi/Articles/3098/18450/khoi-nghia-lam-son-1418-1427.html",sourceLabel:"Bảo tàng Lịch sử Quốc gia · Khởi nghĩa Lam Sơn"},
      "tay-son":{name:"Ngọc Hồi – Đống Đa",year:"1789",place:"Thăng Long",summary:"Quang Trung tổ chức cuộc hành quân nhanh ra Bắc và đánh tan quân Thanh vào dịp Tết Kỷ Dậu.",steps:["Tập hợp lực lượng tại Phú Xuân.","Hành quân thần tốc ra Bắc.","Tiến công nhiều hướng vào hệ thống đồn trại.","Giải phóng Thăng Long."],remember:"Cuộc tiến quân thể hiện tốc độ, bất ngờ và khả năng tổ chức của quân Tây Sơn.",source:"https://baotanglichsu.vn/vi/Articles/3101/18710/van-ban-quang-trung-luu-giu-tai-bao-tang-lich-su-quoc-gia.html",sourceLabel:"Bảo tàng Lịch sử Quốc gia · Quang Trung"}
    },
    family:{
      ngo:{title:"Hoàng hệ nhà Ngô",note:"Quan hệ giữa Dương Tam Kha và Dương hậu được các tài liệu ghi khác nhau; sơ đồ không khẳng định anh hay em.",nodes:[
        {id:"ngo-quyen",name:"Ngô Quyền",role:"Vua · 939–944",level:0,kind:"king"},
        {id:"duong-nhu-ngoc",name:"Dương Như Ngọc",role:"Vương hậu",level:0,kind:"consort"},
        {id:"ngo-xuong-ngap",name:"Ngô Xương Ngập",role:"Con · Thiên Sách Vương",level:1,kind:"king"},
        {id:"ngo-xuong-van",name:"Ngô Xương Văn",role:"Con · Nam Tấn Vương",level:1,kind:"king"},
        {id:"duong-tam-kha",name:"Dương Tam Kha",role:"Họ Dương · nắm quyền 944–950",level:1,kind:"regent"},
        {id:"ngo-xuong-xi",name:"Ngô Xương Xí",role:"Con Ngô Xương Ngập",level:2,kind:"descendant"}
      ]}
    },
    periodSources:{
      ngo:[["Bảo tàng Lịch sử Quốc gia · Ngô Quyền","https://baotanglichsu.vn/vi/Articles/3098/13934/ngo-quyen-va-chienthang-bach-dang-nam-938.html"],["Nhà Ngô · danh sách vua và thế phả","https://vi.wikipedia.org/wiki/Nh%C3%A0_Ng%C3%B4"]],
      ly:[["Bảo tàng Lịch sử Quốc gia · Lý–Trần","https://baotanglichsu.vn/vi/Articles/4081/trieu-ly-tran-1009-1400"],["Trang phục quan lại thời Lý · nguồn tham khảo tạo hình","https://quocsuquan92.blogspot.com/2016/06/trang-phuc-quan-lai-thoi-ly-thuong-phuc.html"]]
    }
  };
})();
