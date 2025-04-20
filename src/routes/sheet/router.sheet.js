import express from 'express';
import SheetController from './controller.sheet.js';
import SheetMiddleware from './middleware/index.js';

const router = express.Router({ mergeParams: true })

router.route('/').post(
    SheetMiddleware.Authorize.add,
    SheetMiddleware.Validate.add,
    SheetController.add
).get(
    SheetMiddleware.Authorize.find,
    SheetMiddleware.Validate.find,
    SheetController.find
)

router.route('/:sheetId').get(
    SheetMiddleware.Authorize.get,
    SheetMiddleware.Validate.get,
    SheetController.get
).patch(
    SheetMiddleware.Authorize.update,
    SheetMiddleware.Validate.update,
    SheetController.update
)

export default router