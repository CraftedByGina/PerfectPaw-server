const Shelter = require("../models/shelter.model");

/*
  GET /shelters/my-shelter
*/
const getMyShelter = async(req,res,next) =>{
    try{
        const shelter = await Shelter.findOne({
            adminUserId: req.user._id
        });

        if(!shelter){
            return res.status(404).json({
                message: "Shelter profile not found"
            });
        }
        res.json({
            data:shelter,
        });
    }catch(error){
        next(error);
    }
}

module.exports = {getMyShelter};