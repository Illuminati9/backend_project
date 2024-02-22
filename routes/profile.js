const express = require('express');
const router = express.Router();

const { deleteAccount, updateDisplayPicture, updateProfile, getUserDetails } = require('../controllers/profile')

const { auth } = require('../middlewares/middleware')
const  upload = require('../config/multerS3');

router.post('/deleteAccount', auth, deleteAccount)
router.put('/updateDisplayPicture', auth, updateDisplayPicture)
router.post('/updateProfile', auth, updateProfile)
router.get('/getUserDetails', auth, getUserDetails)

module.exports = router;