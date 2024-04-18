const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    filename:function(req,file,cb){
        if(file){
            const ext = path.extname(file.originalname);
            const fileName = `${file.originalname.replace(ext,'')}${Date.now()}.jpg`;
            req.fileName = fileName;
            cb(null,fileName);
        }
    },
    destination:function(req, file , cb){
        cb(null,path.join(__dirname,'../public/images'))
    },
    
})

const upload = multer({storage});

exports.uploadProfilePic = upload.single('profilePic');