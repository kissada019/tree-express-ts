import { Router } from 'express';
// TODO: import { AdminMiddleware } from '@middlewares/admin.middleware';

const router = Router({ mergeParams: true });

// TODO: router.use(AdminMiddleware);

router.post('/users', (req, res, next) => {
  // TODO: AdminUserController.create
  res.json({ message: '/admin/users POST - placeholder' });
});
router.get('/users', (req, res, next) => {
  // TODO: AdminUserController.list
  res.json({ message: '/admin/users GET - placeholder' });
});
router.put('/users/:id', (req, res, next) => {
  // TODO: AdminUserController.update
  res.json({ message: '/admin/users/:id PUT - placeholder' });
});
router.delete('/users/:id', (req, res, next) => {
  // TODO: AdminUserController.remove
  res.json({ message: '/admin/users/:id DELETE - placeholder' });
});
router.post('/merchants', (req, res, next) => {
  // TODO: MerchantAdminController.create
  res.json({ message: '/admin/merchants POST - placeholder' });
});
router.get('/merchants', (req, res, next) => {
  // TODO: MerchantAdminController.list
  res.json({ message: '/admin/merchants GET - placeholder' });
});
router.get('/merchants/:id', (req, res, next) => {
  // TODO: MerchantAdminController.getOne (with accounts)
  res.json({ message: '/admin/merchants/:id GET - placeholder' });
});
router.put('/merchants/:id', (req, res, next) => {
  // TODO: MerchantAdminController.update
  res.json({ message: '/admin/merchants/:id PUT - placeholder' });
});
router.delete('/merchants/:id', (req, res, next) => {
  // TODO: MerchantAdminController.offboard
  res.json({ message: '/admin/merchants/:id DELETE - placeholder' });
});
router.post('/merchants/:merchant_id/accounts', (req, res, next) => {
  // TODO: AccountAdminController.create
  res.json({ message: '/admin/merchants/:merchant_id/accounts POST - placeholder' });
});
router.get('/merchants/:merchant_id/accounts', (req, res, next) => {
  // TODO: AccountAdminController.list
  res.json({ message: '/admin/merchants/:merchant_id/accounts GET - placeholder' });
});
router.put('/merchants/:merchant_id/accounts/:id', (req, res, next) => {
  // TODO: AccountAdminController.update
  res.json({ message: '/admin/merchants/:merchant_id/accounts/:id PUT - placeholder' });
});
router.delete('/merchants/:merchant_id/accounts/:id', (req, res, next) => {
  // TODO: AccountAdminController.remove
  res.json({ message: '/admin/merchants/:merchant_id/accounts/:id DELETE - placeholder' });
});

export default router;