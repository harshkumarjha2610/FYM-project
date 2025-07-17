const Medicine = require('../Models/medicine.model');

// Get all medicines
const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    console.log('Fetched medicines:', medicines);
    res.status(200).json({ medicines: medicines || [] });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
};

// Search medicines by query
const searchMedicines = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      const medicines = await Medicine.find();
      return res.status(200).json({ medicines: medicines || [] });
    }

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { manufacturer: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    });
    console.log('Search results:', medicines);
    res.status(200).json({ medicines: medicines || [] });
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({ error: 'Failed to search medicines' });
  }
};

module.exports = { getAllMedicines, searchMedicines };