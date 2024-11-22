const {Router} = require('express')
const { RegisterAdmin, LoginAdmin, LogoutAdmin, RefreshToken, getAdmins, getAdminById, updateAdminById, deleteAdminById } = require('../controllers/admin.controller');
const admin_police = require('../middleware/admin_police');
const creator_police = require('../middleware/creator_police');

const router = Router()


router.post('/add', creator_police,RegisterAdmin)
router.post("/login", LoginAdmin);
router.post('/logout', LogoutAdmin);
router.post("/refresh", RefreshToken);

router.get('/', creator_police,getAdmins)
router.get("/:id", admin_police,getAdminById);

router.put('/update/:id', admin_police,updateAdminById)

router.delete("/delete/:id", creator_police,deleteAdminById);



module.exports = router