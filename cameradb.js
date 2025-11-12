//
// ---------------------------------
// 
//  카메라 데이터베이스 (cameradb.js)
//  이 파일에서 카메라 데이터를 직접 수정/추가하세요.
// 
//  [속성 설명]
//  name: 모델명 (드롭다운에 표시될 이름)
//  sensorH: 센서 가로 크기 (mm)
//  sensorV: 센서 세로 크기 (mm)
//  resH: 센서 가로 해상도 (pixel)
//  resV: 센서 세로 해상도 (pixel)
//  fps: (신규) 카메라의 최대 FPS (숫자)
//
// ---------------------------------
//

const cameraDb = {
    cognex: [
        // 2000 시리즈
        { name: "IS2000-1/3", sensorH: 4.8, sensorV: 3.6, resH: 640, resV: 480, fps: 40 },
        { name: "IS2001-1/3", sensorH: 4.8, sensorV: 3.6, resH: 1280, resV: 960, fps: 20 },
        // 8000 시리즈
        { name: "IS8400", sensorH: 7.1, sensorV: 5.4, resH: 640, resV: 480, fps: 125 },
        { name: "IS8401", sensorH: 7.1, sensorV: 5.4, resH: 1280, resV: 1024, fps: 60 },
        { name: "IS8402", sensorH: 7.1, sensorV: 5.4, resH: 1600, resV: 1200, fps: 45 },
        { name: "IS8405", sensorH: 5.7, sensorV: 4.2, resH: 2592, resV: 1944, fps: 30 },
        { name: "IS8505", sensorH: 8.4, sensorV: 7.1, resH: 2448, resV: 2048, fps: 20 },
        { name: "IS8900", sensorH: 2.19, sensorV: 1.6, resH: 800, resV: 600, fps: 150 },
        // (이하 모델들에도 fps 속성을 추가해주세요)
        { name: "IS8902", sensorH: 5.2, sensorV: 3.2, resH: 1920, resV: 1200, fps: 60 },
        { name: "IS8905", sensorH: 6.7, sensorV: 5.6, resH: 2448, resV: 2048, fps: 30 },
        { name: "IS8912", sensorH: 11.2, sensorV: 8.2, resH: 4096, resV: 3000, fps: 10 },
        // 7000 시리즈
        { name: "IS7900", sensorH: 7.1, sensorV: 5.4, resH: 800, resV: 600, fps: 100 },
        { name: "IS7901", sensorH: 7.1, sensorV: 5.4, resH: 1280, resV: 1024, fps: 50 },
        { name: "IS7902", sensorH: 6.6, sensorV: 4.1, resH: 1600, resV: 1200, fps: 40 },
        { name: "IS7905", sensorH: 8.4, sensorV: 7.1, resH: 2448, resV: 2048, fps: 20 },
        // 2800/3800 시리즈
        { name: "IS3801", sensorH: 5.5, sensorV: 4.0, resH: 1440, resV: 1080, fps: 60 },
        { name: "IS3803", sensorH: 7.1, sensorV: 5.4, resH: 2048, resV: 1536, fps: 40 },
        { name: "IS3805", sensorH: 8.4, sensorV: 7.1, resH: 2448, resV: 2048, fps: 30 },
        { name: "IS3808", sensorH: 8.4, sensorV: 7.1, resH: 2840, resV: 2840, fps: 20 },
        { name: "IS3812", sensorH: 14.1, sensorV: 10.3, resH: 4096, resV: 3000, fps: 10 },
        { name: "IS3816", sensorH: 14.1, sensorV: 10.3, resH: 5320, resV: 3032, fps: 8 },
        { name: "IS2800", sensorH: 4.8, sensorV: 3.6, resH: 720, resV: 540, fps: 60 },
        { name: "IS2801", sensorH: 4.8, sensorV: 3.6, resH: 1440, resV: 1080, fps: 40 },
        { name: "IS2802", sensorH: 4.8, sensorV: 3.6, resH: 1920, resV: 1080, fps: 30 },
        // D900 시리즈
        { name: "D905", sensorH: 8.4, sensorV: 7.1, resH: 2448, resV: 2048, fps: 20 },
        { name: "D902", sensorH: 5.5, sensorV: 4.0, resH: 1920, resV: 1200, fps: 30 },
    ],
    hikrobot: [
        // (Res * Pixel Size / 1000 = Sensor Size mm)
        { name: "MV-CS004-10UM", resH: 720, resV: 540, pixelSize: 6.9, sensorH: (720*6.9/1000), sensorV: (540*6.9/1000), fps: 120 },
        { name: "MV-CA003-20GM", resH: 672, resV: 512, pixelSize: 4.8, sensorH: (672*4.8/1000), sensorV: (512*4.8/1000), fps: 200 },
        { name: "MV-CA016-10GM", resH: 1440, resV: 1080, pixelSize: 3.45, sensorH: (1440*3.45/1000), sensorV: (1080*3.45/1000), fps: 60 },
        { name: "MV-CA050-11UM", resH: 2448, resV: 2048, pixelSize: 3.45, sensorH: (2448*3.45/1000), sensorV: (2048*3.45/1000), fps: 24 },
        { name: "MV-CE050-30GM", resH: 2592, resV: 1944, pixelSize: 2.2, sensorH: (2592*2.2/1000), sensorV: (1944*2.2/1000), fps: 30 },
        { name: "MV-CH650-90XC", resH: 9344, resV: 7000, pixelSize: 3.2, sensorH: (9344*3.2/1000), sensorV: (7000*3.2/1000), fps: 6 },
    ]
};