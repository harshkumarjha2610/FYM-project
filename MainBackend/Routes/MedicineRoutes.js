const express = require('express');
const router = express.Router();
const { getAllMedicines, searchMedicines } = require('../Controllers/MedicineController');

router.get('/medicines', getAllMedicines);
router.get('/medicines/search', searchMedicines);

module.exports = router;