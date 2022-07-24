var express = require('express');
var router = express.Router();
const isBase64 = require ('is-base64');
const base64Img = require('base64-img');
const fs = require('fs');

// import model
const {Media} = require('../models');

router.get('/', async(req, res)=>{
  const media = await Media.findAll(
    // get id dan image saja
    {
      attributes:['id','image']
    }
  );

  const mappedMedia = media.map((m)=>{
    m.image = `${req.get('host')}/${m.image}`;
    return m;
  })
  return res.json({
    status:'success',
    data: mappedMedia
  })
})

router.post('/', (req, res)=>{
  // res.send('12345');
  const image = req.body.image;

  if(!isBase64(image,{mimeRequired: true})){
    return res.status(400).json({
      status: 'error',
      message:'Invalid base64'
    });
  }
  // return res.send('ok')
  // 1 jenis file image, 2 letak file, 3 nama file, 4 option
  base64Img.img(image, './public/images', Date.now(),async (err, filepath) =>{
    if(err){
      return 
        res.status(400).json({
          status:'error',
          message:err.message
        })
    }
    // get last filename public/images/1231311.png
    const filename = filepath.split('/').pop();
    // simpan filename ke db
    const media = await Media.create({
      image: `images/${filename}`
    });
    // return
    return res.json({
      status: 'success',
      data: `${req.get('host')}/images/${filename}`
    });
  });
});

router.delete('/:id', async(req, res)=>{
  const id = req.params.id;

  const media = await Media.findByPk(id);

  if(!media){
    return res.status(400).json({
      status:'error',
      message:'media not found'
    });
  }
  fs.unlink(`./public/${media.image}`, async(err)=>{
    if(err){
      return res.status(400).json({
        status:'error',
        message: 'media not found'
      });
    }
    await media.destroy();
    return res.status(200).json({
      status:'success',
      message:'Data Deleted'
    });
  })
});

module.exports = router;
