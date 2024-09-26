import express from 'express';
import ProductController from '../controllers/productController.js';

const router = express.Router();

router.get('/products', ProductController.listProducts);
router.get('/products/:id', ProductController.getProduct);
router.post('/products', ProductController.createProduct);
router.put('/products/:id', ProductController.updateProduct);
router.delete('/products/:id', ProductController.deleteProduct);

export default router;