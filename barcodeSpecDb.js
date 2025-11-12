const barcodeSpecDb = {
    cognex: {
        // DataMan 8700 Series (8MP)
        "dm8700_8mp": {
            "lens_16mm_ll": [
                { wd: 150, fovH: 90, fovV: 68, minEl: 0.08 },
                { wd: 500, fovH: 300, fovV: 225, minEl: 0.20 },
                { wd: 1500, fovH: 900, fovV: 675, minEl: 0.60 }
            ],
            "lens_25mm_ll": [
                { wd: 200, fovH: 80, fovV: 60, minEl: 0.06 },
                { wd: 500, fovH: 200, fovV: 150, minEl: 0.12 },
                { wd: 1500, fovH: 600, fovV: 450, minEl: 0.35 }
            ]
        },
        // DataMan 580 Series (5MP)
        "dm580_5mp": {
            "lens_16mm_ll": [
                { wd: 100, fovH: 65, fovV: 49, minEl: 0.10 },
                { wd: 400, fovH: 260, fovV: 195, minEl: 0.25 },
                { wd: 1000, fovH: 650, fovV: 488, minEl: 0.60 }
            ],
            "lens_25mm_ll": [
                { wd: 150, fovH: 70, fovV: 53, minEl: 0.08 },
                { wd: 500, fovH: 233, fovV: 175, minEl: 0.18 },
                { wd: 1000, fovH: 466, fovV: 350, minEl: 0.35 }
            ]
        },
        // DataMan 474 (3MP)
        "dm474_3mp": {
            "lens_16mm_ll": [
                { wd: 100, fovH: 60, fovV: 45, minEl: 0.12 },
                { wd: 300, fovH: 180, fovV: 135, minEl: 0.30 },
                { wd: 1000, fovH: 600, fovV: 450, minEl: 0.80 }
            ],
            "lens_25mm_c": [
                { wd: 200, fovH: 75, fovV: 56, minEl: 0.10 },
                { wd: 500, fovH: 187, fovV: 140, minEl: 0.25 },
                { wd: 1000, fovH: 375, fovV: 281, minEl: 0.50 }
            ]
        },
        // DataMan 380 Series (1.6MP)
        "dm380_1.6mp": {
            "lens_16mm_f": [
                { wd: 100, fovH: 85, fovV: 64, minEl: 0.20 },
                { wd: 300, fovH: 255, fovV: 191, minEl: 0.50 },
                { wd: 800, fovH: 680, fovV: 510, minEl: 1.20 }
            ],
            "lens_25mm_f": [
                { wd: 150, fovH: 75, fovV: 56, minEl: 0.15 },
                { wd: 500, fovH: 250, fovV: 188, minEl: 0.40 },
                { wd: 1000, fovH: 500, fovV: 375, minEl: 0.80 }
            ]
        },
        // DataMan 370 (2MP)
        "dm370_2mp": {
            "lens_16mm_ll": [
                { wd: 100, fovH: 70, fovV: 50, minEl: 0.15 },
                { wd: 500, fovH: 350, fovV: 250, minEl: 0.60 }
            ]
        },
        // DataMan 280 Series (1.3MP)
        "dm280_1.3mp": {
            "lens_16mm_f": [
                { wd: 100, fovH: 90, fovV: 68, minEl: 0.25 },
                { wd: 300, fovH: 270, fovV: 203, minEl: 0.60 },
                { wd: 700, fovH: 630, fovV: 473, minEl: 1.40 }
            ],
            "lens_25mm_f": [
                { wd: 150, fovH: 80, fovV: 60, minEl: 0.20 },
                { wd: 500, fovH: 267, fovV: 200, minEl: 0.50 },
                { wd: 1000, fovH: 533, fovV: 400, minEl: 1.00 }
            ]
        }
    },
    hikrobot: {
        // ... (Hikrobot 데이터는 동일)
    }
};