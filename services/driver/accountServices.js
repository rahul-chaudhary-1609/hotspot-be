const { Driver, DriverAddress, DriverVehicleDetail, DriverBankDetail } = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {

editPersonalDetails: async (params, driver) => {
    //const driverDetails = await Driver.findByPk(driver.id);
   // console.log("driver details",driverDetails)
   if(params.email){
    const findEmail = await utility.convertPromiseToObject(
      await Driver.findOne({
        where: {
          email:params.email,
        }
      })
    )
    if(findEmail) throw new Error(constants.MESSAGES.email_already_registered);
   }

   if(params.phone_no){
    const findContact = await utility.convertPromiseToObject(
      await Driver.findOne({
        where: {
          //country_code:params.country_code,
          phone_no:params.phone_no
        }
      })
    )
    if(findContact) throw new Error(constants.MESSAGES.phone_already_registered);
   }
   const driverPersonalData=await Driver.update(params,{ where: {id:Number(driver.id)} });
   return true
 },

 getPersonalDetails: async (driver) => {
 const driverPersonalData=await Driver.findOne({
  where: { id: driver.id}
})
 return driverPersonalData
},

 

 editAddressDetails: async (params, driver) => {
  const driverAddressData=await DriverAddress.update(params,{ where: {driver_id:Number(driver.id)} });
  return true
 },

 getAddressDetails: async (driver) => {
  const driverAddressData=await DriverAddress.findOne({
    where: { driver_id: driver.id}
  })
   return driverAddressData
 },

 

 editVehicleDetails: async (params, driver) => {
  const driverVehicleData=await DriverVehicleDetail.update(params,{ where: {drver_id:Number(driver.id)} });
  return true
 },

 getVehicleDetails: async (driver) => {
  const driverVehicleData=await DriverVehicleDetail.findOne({
    where: { driver_id: driver.id}
  })
   return driverVehicleData
 },

  editBankDetails: async (params, driver) => {
    params.stripe_publishable_key = utility.encrypt(params.stripe_publishable_key);
    params.stripe_secret_key = utility.encrypt(params.stripe_secret_key);
  const driverBankData=await DriverBankDetail.update(params,{ where: {driver_id:Number(driver.id)} });
  return true
 },

 getBankDetails: async (driver) => {
  const driverBankData=await DriverBankDetail.findOne({
    where: { driver_id: driver.id}
  })
   return driverBankData
 },
 

}