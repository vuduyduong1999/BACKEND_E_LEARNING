const router = require('express').Router()
const Users = require('../Models/Users')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const verifytoken = require('./verifyToken')
const jwt = require('jsonwebtoken')
// =============================
const schemaUpdate = Joi.object({
  token: Joi.string(),
  ma: Joi.string().length(2),
  hoVaTen: Joi.string(),
  sdt: Joi.string().alphanum().length(10),
  ngaySinh: Joi.date(),
  diaChi: Joi.string(),
  ngheNghiep: Joi.string(),
  gioiTinh: Joi.string().max(4),
  gioiThieu: Joi.string(),
})
const schemaRegister = Joi.object({
  hoVaTen: Joi.string().required(),
  sdt: Joi.string().alphanum().length(10).required(),
  password: Joi.string().min(6).required(),
})
const schemaLogin = Joi.object({
  sdt: Joi.string().alphanum().length(10).required(),
  password: Joi.string().min(6).required(),
})
const schemaChangePass = Joi.object({
  token: Joi.string(),
  oldpassword: Joi.string().min(6).required(),
  newpassword: Joi.string().min(6).required(),
})
// ================================
// CHANGE PASSWORD
router.post('/changepassword', verifytoken, async (req, res) => {
  try {
    const { id } = req.user
    const { oldpassword, newpassword } = req.body
    const { error } = schemaChangePass.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }
    const userExists = await new Users({ id }).fetch({ require: false })
    const isValidPassWord = await bcrypt.compareSync(oldpassword, userExists.get('password'))

    if (!isValidPassWord) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect...' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newpassword, salt)
    await userExists.set('password', hashedPassword).save()
    res.status(200).json({
      success: true,
      message: 'Change password success!!!',
    })
  } catch (error) {
    console.log('error: ', error)
    res.status(400).json({ success: false, message: error })
  }
})
// UPDATE PROFILE
router.post('/', verifytoken, async (req, res) => {
  try {
    const { id } = req.user
    const { ma, hoVaTen, ngaySinh, diaChi, ngheNghiep, sdt, gioiTinh, gioiThieu } = req.body
    const { error } = schemaUpdate.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }
    const userExists = await new Users({ id }).fetch({ require: false })
    if (!userExists) {
      return res.status(400).json({ success: false, message: 'User not found....' })
    }
    if (ma) {
      userExists.set('ma', ma)
      await userExists.save()
    }
    if (hoVaTen) {
      userExists.set('hoVaTen', hoVaTen)
      await userExists.save()
    }
    if (ngaySinh) {
      userExists.set('ngaySinh', ngaySinh)
      await userExists.save()
    }
    if (diaChi) {
      userExists.set('diaChi', diaChi)
      await userExists.save()
    }
    if (ngheNghiep) {
      userExists.set('ngheNghiep', ngheNghiep)
      await userExists.save()
    }
    if (sdt) {
      userExists.set('sdt', sdt)
      await userExists.save()
    }
    if (gioiTinh) {
      userExists.set('gioiTinh', gioiTinh)
      await userExists.save()
    }
    if (gioiThieu) {
      userExists.set('gioiThieu', gioiThieu)
      await userExists.save()
    }

    userExists.set('password', '')
    res.status(200).json({ success: true, message: 'Update profile success!!!', data: { ...userExists.attributes } })
  } catch (error) {
    console.log('error: ', error)
    res.status(400).json({ success: false, message: error })
  }
})
// GET PROFILE
router.post('/profile', verifytoken, async (req, res) => {
  try {
    const { id } = req.user

    const userExists = await new Users({ id }).fetch({ require: false })

    if (!userExists) {
      return res.status(400).json({ success: false, message: 'User not found....' })
    }
    userExists.set('password', '')
    res.status(200).json({ success: true, data: { ...userExists.attributes } })
  } catch (error) {
    console.log('error: ', error)
    res.status(400).json({ success: false, message: error })
  }
})
// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { sdt, password } = req.body
    const { error } = schemaLogin.validate(req.body) // verify
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }
    const userExist = await new Users({ sdt }).fetch({ require: false })
    if (!userExist) {
      return res.status(400).json({
        success: false,
        message: 'Phone number not found...',
      })
    }
    const isValidPassWord = await bcrypt.compareSync(password, userExist.get('password'))
    if (!isValidPassWord) {
      return res.status(400).json({
        success: false,
        message: 'Password invalid...',
      })
    }
    const token = jwt.sign({ id: userExist.get('id') }, process.env.TOKEN_SECRET)
    res.status(200).json({ success: true, data: { token } })
  } catch (error) {
    console.log('error: ', error)
    res.status(400).json({ success: false, message: error })
  }
})
// REGISTER FOR STUDENT
router.post('/register/student', async (req, res) => {
  try {
    const { hoVaTen, sdt, password } = req.body
    const { error } = schemaRegister.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }
    const usersExist = await new Users({ sdt }).fetch({ require: false })
    if (usersExist) {
      return res.status(400).json({ success: false, message: 'Phone number already exists...' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = await new Users({ hoVaTen, sdt, password: hashedPassword }).save()
    res.status(200).json({
      success: true,
      data: { fullname: newUser.get(hoVaTen), code: newUser.get('ma') },
    })
  } catch (error) {
    console.log('error', error)
    res.status(400).json({
      success: false,
      message: error,
    })
  }
})
// REGISTER FOR TEACHER
router.post('/register/teacher', async (req, res) => {
  try {
    const { hoVaTen, sdt, password } = req.body
    const { error } = schemaRegister.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      })
    }
    const usersExist = await new Users({ sdt }).fetch({ require: false })
    if (usersExist) {
      return res.status(400).json({ success: false, message: 'Phone number already exists...' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = await new Users({ ma: 'GV', hoVaTen, sdt, password: hashedPassword }).save()
    res.status(200).json({
      success: true,
      data: { fullname: newUser.get(hoVaTen), code: newUser.get('ma') },
    })
  } catch (error) {
    console.log('error', error)
    res.status(400).json({
      success: false,
      message: error,
    })
  }
})
module.exports = router
