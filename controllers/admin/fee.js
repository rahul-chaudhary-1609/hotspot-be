const models = require('../../models');
const { Op } = require("sequelize");
const validation = require("../../utils/admin/validation");

module.exports = {
    addFee: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const feeResult = validation.feeSchema.validate(req.body);

            if (feeResult.error) return res.status(400).json({ status: 400, message: feeResult.error.details[0].message });

            const order_range_from = parseInt(req.body.order_range_from);
            const order_range_to = parseInt(req.body.order_range_to);
            const fee_type = req.body.fee_type;
            const fee = parseFloat(req.body.fee);

            await models.Fee.create({
                order_range_from,order_range_to,fee_type,fee
            })

            return res.status(200).json({ status: 200, message: `Fee added` });
            

       } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
      } 
    },

    editFee: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const fee_id = parseInt(req.params.feeId);

            const readFee = await models.Fee.findByPk(fee_id);

            if (!readFee) return res.status(404).json({ status: 404, message: `no fee record found with this id` });

            const order_range_from = req.body.order_range_from?parseInt(req.body.order_range_from):readFee.order_range_from;
            const order_range_to = req.body.order_range_to?parseInt(req.body.order_range_to):readFee.order_range_to;
            const fee_type = req.body.fee_type || readFee.fee_type;
            const fee = req.body.fee?parseFloat(req.body.fee):readFee.fee;

            const feeResult = validation.feeSchema.validate({order_range_from,order_range_to,fee_type,fee});

            if (feeResult.error) return res.status(400).json({ status: 400, message: feeResult.error.details[0].message });

            await models.Fee.update({
                order_range_from,order_range_to,fee_type,fee
            },
                {
                    where: {
                        id:fee_id
                    },
                    returning: true,
                }
            );

            return res.status(200).json({ status: 200, message: `Fee updated` });
            

       } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
      } 
    },

    getDriverFee: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const driverFees = await models.Fee.findAndCountAll({
                where: {
                    fee_type:'Driver'
                },
                order:[['order_range_from']]
            })

            if(driverFees.count===0) return res.status(404).json({ status: 404, message: `no fee found` });

            return res.status(200).json({ status: 200, driverFees });
            

       } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
      } 
    }
}