const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All user routes require Admin or Hub Manager
router.use(authenticateToken);
router.use(authorizeRole(['Admin', 'Hub Manager']));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);

module.exports = router;
