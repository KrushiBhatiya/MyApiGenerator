const MC = require("../model/index");
const MD = require("../model/modelData");
const PD = require("../model/projectData");
const { parse, isValid: isValidDate } = require("date-fns");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const multer = require("multer");
cloudinary.config({
  cloud_name: "dgmmsxdaw",
  api_key: "311441745485167",
  api_secret: "vLOgyyDs6pfb9vyL0lJ60Yp6vGs",
});

exports.authDataCheck = async (req, res) => {
  var token = req.headers.authorization;
  var { email, password } = req.body;

  try {
    var authData = await MD.findOne({
      projectKey: token,
      modelName: "signUp",
      "modelFieldData.email": email,
      "modelFieldData.password": password,
    });

    if (!authData) throw new Error("Invalid User");

    const flattenedData = {
      _id: authData._id,
      ...authData.modelFieldData,
      __v: authData.__v,
    };
    res.status(200).json({
      Status: "Success",
      Message: "User login Success",
      data: flattenedData,
    });
  } catch (error) {
    res.status(404).json({
      Status: "Fail",
      Message: error.message,
    });
  }
};

exports.authCreateData = async (req, res) => {
  var token = req.headers.authorization;
  // console.log("====");

  try {
    var tokenData = await MC.findOne({
      projectKey: token,
      modelName: "signUp",
    });

    // console.log("tokenData ==> ",tokenData);

    // if(!tokenData) throw new Error("Invalid")

    var preKey = Object.keys(tokenData.modelField);
    // console.log("preKey ==> ", preKey);

    var postKey = Object.keys(req.body);

    if (Object.keys(req.body).length === 0) {
      throw new Error("Please Enter Data");
    }
    if (JSON.stringify(preKey) !== JSON.stringify(postKey)) {
      throw new Error("Key doesn't Match");
    }

    const isValid = preKey.every((key, index) => {
      // console.log("key ==> ==> ", key);

      const getType = tokenData.modelField[key];
      let dataValue = req.body[key];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      console.log("==>", dataValue);

      if (getType === "String") {
        return typeof dataValue === "string";
      }
      if (getType === "Email") {
        return typeof dataValue === "string" && emailRegex.test(dataValue);
      }
      return false;
    });

    if (!isValid) {
      throw new Error("Validation Error");
    }

    const fieldConditions = Object.entries(req.body).map(([key, value]) => ({
      [`modelFieldData.${key}`]: value,
    }));

    // Combine with other fixed conditions
    const findData = await MD.findOne({
      projectKey: token,
      modelName: "signUp",
      $or: fieldConditions,
    });

    if (findData) throw new Error("Already User Exist!!");

    await MD.create({
      projectKey: token,
      modelName: "signUp",
      modelFieldData: req.body,
    });
    res.status(200).json({
      Status: "Success",
      Message: "User Register Success",
      Data: req.body,
    });
  } catch (error) {
    res.status(404).json({
      Status: "Fail",
      Message: error.message,
    });
  }
};
exports.createData = async (req, res) => {
  var token = req.headers.authorization;
  var collectionName = req.params.name;
  var validCollection = await MC.findOne({
    projectKey: token,
    modelName: collectionName,
  });
  var tokenData = await MC.findOne({
    projectKey: token,
    modelName: collectionName,
  });
  var checkFieldValue = Object.values(tokenData.modelField);

  var preKey = Object.keys(tokenData.modelField);
  // console.log("00000000", preKey);

  var postKey = Object.keys(req.body);
  // console.log("1-1-1-1--1-1-1----", postKey);

  try {
    if (!validCollection) throw new Error("Invalid CollectionName");

    if (
      checkFieldValue.includes("SingleFile") ||
      checkFieldValue.includes("MultiFile")
    ) {
      if (
        Object.keys(req.body).length === 0 &&
        (!req.files || req.files.length === 0)
      ) {
        throw new Error("Please Enter Data");
      }
    } else {
      if (Object.keys(req.body).length === 0) {
        throw new Error("Please Enter Data");
      }
    }

    if (
      checkFieldValue.includes("SingleFile") ||
      checkFieldValue.includes("MultiFile")
    ) {
      if (
        !req.headers["content-type"] ||
        !req.headers["content-type"].includes("multipart/form-data")
      ) {
        throw new Error(
          "Invalid Content-Type. You must use 'form-data' for uploading files."
        );
      }
      req.files.forEach((file) => {
        if (!postKey.includes(file.fieldname)) {
          postKey.push(file.fieldname);
        }
      });
    }

    const areArraysEqual = (a, b) => {
      if (a.length !== b.length) return false;
      const sortedA = [...a].sort();
      console.log("sortedA ==> ",sortedA);
      
      const sortedB = [...b].sort();
      console.log("sortedB ==> ",sortedB);
      
      return sortedA.every((val, index) => val === sortedB[index]);
    };

    if (!areArraysEqual(preKey, postKey)) {
      throw new Error("Key doesn't Match");
    }
    // console.log("===", JSON.stringify(preKey));
    // console.log("-----", JSON.stringify(postKey));

    // if (JSON.stringify(preKey) !== JSON.stringify(postKey)) {
    //   // console.log("check");
    //   throw new Error("Key doesn't Match");
    // }

    // const allData = await MD.find({ apiKey: token })

    // const duplicateData = await allData.some((item) => {

    //     const { apiKey, ...filterData } = item.toObject(); // Exclude metadata fields
    //     return JSON.stringify(filterData.modelFieldData) === JSON.stringify(req.body);
    // })
    // if (duplicateData) {
    //     throw new Error("Duplicate Key")
    // }

    const filesMap = {};

    if (
      checkFieldValue.includes("SingleFile") ||
      checkFieldValue.includes("MultiFile")
    ) {
      req.files.forEach((file) => {
        // console.log("Uploaded File: ", file);
        const fieldName = file.fieldname;

        // Group files by their fieldname in filesMap
        if (!filesMap[fieldName]) {
          filesMap[fieldName] = [];
        }
        filesMap[fieldName].push(file);
      });
    }

    const isValid = preKey.every((key, index) => {
      const getType = tokenData.modelField[key];
      let dataValue = req.body[key];

      if (getType === "SingleFile") {
        dataValue =
          filesMap[key] && filesMap[key].length === 1
            ? filesMap[key][0]
            : undefined;
      } else if (getType === "MultiFile") {
        dataValue = filesMap[key] || [];
      } else {
        dataValue = req.body[key];
      }

      const isFormData =
        req.headers["content-type"] &&
        req.headers["content-type"].includes("multipart/form-data");

      if (getType === "String") {
        return typeof dataValue === "string";
      }
      if (getType === "Number") {
        if (isFormData) {
          // Convert to number for form-data
          const numberValue = Number(dataValue);
          if (!isNaN(numberValue)) {
            req.body[key] = numberValue; // Convert and store
            return true;
          }
          return false;
        }
        return typeof dataValue === "number";
      }
      if (getType === "Boolean") {
        const isFormData =
          req.headers["content-type"] &&
          req.headers["content-type"].includes("multipart/form-data");
        if (isFormData) {
          if (dataValue === "true") {
            req.body[key] = true;
            return true;
          }
          if (dataValue === "false") {
            req.body[key] = false;
            return true;
          }
          if (dataValue === "" || dataValue === undefined) {
            req.body[key] = false; // Default to false
            return true;
          }
          return false; // Invalid value for Boolean
        }
        return typeof dataValue === "boolean";
      }
      if (typeof dataValue === "boolean") {
        req.body[key] = dataValue; // Assign the Boolean value as-is
        return true;
      }
      if (getType === "Date") {
        if (isFormData) {
          // Convert to date for form-data
          const parsedDate1 = parse(dataValue, "yyyy-MM-dd", new Date());
          const parsedDate2 = parse(dataValue, "dd-MM-yyyy", new Date());
          if (isValidDate(parsedDate1)) {
            // Create a date without timezone adjustments
            req.body[key] = new Date(
              Date.UTC(
                parsedDate1.getFullYear(),
                parsedDate1.getMonth(),
                parsedDate1.getDate()
              )
            );
            return true;
          }
          if (isValidDate(parsedDate2)) {
            req.body[key] = new Date(
              Date.UTC(
                parsedDate2.getFullYear(),
                parsedDate2.getMonth(),
                parsedDate2.getDate()
              )
            );
            return true;
          }
          return false;
        }
        return Object.prototype.toString.call(dataValue) === "[object Date]";
      }
      if (getType === "SingleFile") {
        return dataValue !== undefined; // Ensure a single file is uploaded
      }
      if (getType === "MultiFile") {
        return dataValue.length > 0; // Ensure at least one file is uploaded
      }
      if (typeof getType === "string" && getType.startsWith("connect:")) {
        if (mongoose.Types.ObjectId.isValid(dataValue)) {
          req.body[key] = new mongoose.Types.ObjectId(dataValue); // Convert and store as ObjectId
          return true;
        }
        return false; // Invalid ObjectId
      }
      return false;
    });

    if (!isValid) {
      throw new Error("Validation Error");
    }
    if (
      checkFieldValue.includes("SingleFile") ||
      checkFieldValue.includes("MultiFile")
    ) {
      if (
        !req.headers["content-type"] ||
        !req.headers["content-type"].includes("multipart/form-data")
      ) {
        throw new Error(
          "Invalid Content-Type. You must use 'form-data' for uploading files."
        );
      } else {
        const databaseEntry = {}; // Object to store final database data

        // Validate and process text fields
        for (const key in req.body) {
          const value = req.body[key];

          // Allow `false` for Boolean fields and only throw errors for truly missing or empty values
          if (value === undefined || value === null || value === "") {
            if (tokenData.modelField[key] === "Boolean" && value === false) {
              continue; // Allow `false` for Boolean fields
            }
            throw new Error(`Field ${key} is empty. Please provide a value.`);
          }

          // Add the validated value to the database entry
          databaseEntry[key] = value;
        }

        // Array to store uploaded file URLs
        const uploadedImages = [];

        // Process uploaded files
        for (let file of req.files) {
          const fieldName = file.fieldname;

          // Validate file
          if (!file.path || file.path.trim() === "") {
            throw new Error(
              `File field ${fieldName} is empty. Please upload a file.`
            );
          }
          // console.log("Processing field:", fieldName); // Debugging log

          // Determine field type
          const fieldType = tokenData.modelField[fieldName]; // Get field type
          // console.log("Field type for", fieldName, "is", fieldType); // Debugging log

          // Upload file to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "uploads", // Specify folder in Cloudinary
          });

          // Save the Cloudinary URL
          const fileUrl = result.secure_url;
          uploadedImages.push(fileUrl); // Store URL for response/debugging

          // Store URLs in databaseEntry object based on field type
          if (fieldType === "SingleFile") {
            // For SingleFile, overwrite any existing value with the new URL
            databaseEntry[fieldName] = fileUrl;
          }
          if (fieldType === "MultiFile") {
            // For MultiFile, ensure the field is an array and append the new URL
            if (!databaseEntry[fieldName]) {
              databaseEntry[fieldName] = [];
            }
            databaseEntry[fieldName].push(fileUrl);
          }
        }

        // Save database entry with all fields and Cloudinary URLs
        await MD.create({
          projectKey: token,
          modelName: collectionName,
          modelFieldData: databaseEntry,
        });
        res.status(200).json({
          Status: "Success",
          Message: "Data Enter Success",
          Data: databaseEntry,
        });
      }
    } else {
      await MD.create({
        projectKey: token,
        modelName: collectionName,
        modelFieldData: req.body,
      });
      res.status(200).json({
        Status: "Success",
        Message: "Data Enter Success",
        Data: req.body,
      });
    }
  } catch (error) {
    res.status(404).json({
      Status: "Fail",
      Message: error.message,
    });
  }
};
async function populateFields(token, modelFieldData, modelFields) {
  let populatedItem = { ...modelFieldData };

  for (const [key, value] of Object.entries(modelFieldData)) {
    if (
      typeof modelFields[key] === "string" &&
      modelFields[key].startsWith("connect:")
    ) {
      const referencedCollection = modelFields[key].split(":")[1]; // Extract collection name

      if (mongoose.Types.ObjectId.isValid(value)) {
        try {
          // Find the correct API key for the referenced collection
          const referencedModel = await MC.findOne({
            projectKey: token,
            modelName: referencedCollection,
          });
          // console.log("referencedModel == ",referencedModel);

          if (!referencedModel) continue; // Skip if no matching model
          // console.log(" after referencedModel == ",referencedModel);

          // Fetch referenced document
          const referencedData = await MD.findOne({
            _id: value,
            projectKey: referencedModel.projectKey,
          });

          if (referencedData) {
            // Recursively populate the referenced data
            populatedItem[key] = await populateFields(
              token,
              referencedData.modelFieldData,
              referencedModel.modelField
            );
          }
        } catch (err) {
          console.error(`Error fetching ${referencedCollection}:`, err.message);
        }
      }
    }
  }
  return populatedItem;
}
exports.viewData = async (req, res) => {
  var token = req.headers.authorization;
  var collectionName = req.params.name;

  try {
    // Validate collection
    const validCollection = await MC.findOne({
      projectKey: token,
      modelName: collectionName,
    });
    if (!validCollection) throw new Error("Invalid CollectionName");

    // Fetch data from the requested collection
    const data = await MD.find({
      projectKey: token,
      modelName: collectionName,
    });
    if (data.length === 0) throw new Error("Data not found");
    // console.log("all data ==> ",data);

    // Process data with recursive population
    const populatedData = await Promise.all(
      data.map(async (item) => {
        const { _id, modelFieldData } = item.toObject();
        return {
          _id,
          ...(await populateFields(
            token,
            modelFieldData,
            validCollection.modelField
          )),
        };
      })
    );

    res.status(200).json({
      Status: "Success",
      Message: "Record Get Successfully",
      Data: populatedData,
    });
  } catch (error) {
    res.status(404).json({
      Status: "Fail",
      Message: error.message,
    });
  }
};
exports.deleteData = async (req, res) => {
  const deleteId = req.params.id;
  var token = req.headers.authorization;
  var collectionName = req.params.name;
  var validCollection = await MC.findOne({
    projectKey: token,
    modelName: collectionName,
  });
  try {
    if (!validCollection) throw new Error("Invalid CollectionName");
    const deleteData = await MD.findByIdAndDelete(deleteId);
    if (!deleteData) throw new Error("Record Not Found");
    res.status(200).json({
      Status: "Success",
      Messgae: "Record Delete SuccessFully",
    });
  } catch (error) {
    res.status(404).json({
      Status: "Fail",
      Messgae: error.message,
    });
  }
};
exports.editData = async (req, res) => {
  const editId = req.params.id;
  var token = req.headers.authorization;
  var collectionName = req.params.name;
  var validCollection = await MC.findOne({
    projectKey: token,
    modelName: collectionName,
  });
  var tokenData = await MC.findOne({
    projectKey: token,
    modelName: collectionName,
  });
  var checkFieldValue = Object.values(tokenData.modelField);
  var preKey = Object.keys(tokenData.modelField);
  var postKey = Object.keys(req.body);

  try {
    if (!validCollection) throw new Error("Invalid CollectionName");

    if (
      checkFieldValue.includes("SingleFile") ||
      checkFieldValue.includes("MultiFile")
    ) {
      if (
        Object.keys(req.body).length === 0 &&
        (!req.files || req.files.length === 0)
      ) {
        throw new Error("Please Enter Data");
      }
    } else {
      if (Object.keys(req.body).length === 0) {
        throw new Error("Please Enter Data");
      }
    }

    if (
      checkFieldValue.includes("SingleFile") ||
      checkFieldValue.includes("MultiFile")
    ) {
      if (
        !req.headers["content-type"] ||
        !req.headers["content-type"].includes("multipart/form-data")
      ) {
        throw new Error(
          "Invalid Content-Type. You must use 'form-data' for uploading files."
        );
      }
      req.files.forEach((file) => {
        if (!postKey.includes(file.fieldname)) {
          postKey.push(file.fieldname);
        }
      });
    }

    const areArraysEqual = (a, b) => {
      if (a.length !== b.length) return false;
      const sortedA = [...a].sort();
      console.log("sortedA ==> ",sortedA);
      
      const sortedB = [...b].sort();
      console.log("sortedB ==> ",sortedB);
      
      return sortedA.every((val, index) => val === sortedB[index]);
    };

    if (!areArraysEqual(preKey, postKey)) {
      throw new Error("Key doesn't Match");
    }
    // console.log("preKey ==> ",preKey);
    // console.log("postKey ==> ",postKey);
    // if (JSON.stringify(preKey) !== JSON.stringify(postKey)) {
    //   throw new Error("Key doesn't Match");
    // }

    const filesMap = {};

    if (
      checkFieldValue.includes("SingleFile") ||
      checkFieldValue.includes("MultiFile")
    ) {
      req.files.forEach((file) => {
        // console.log("Uploaded File: ", file);
        const fieldName = file.fieldname;

        // Group files by their fieldname in filesMap
        if (!filesMap[fieldName]) {
          filesMap[fieldName] = [];
        }
        filesMap[fieldName].push(file);
      });
    }
    const isValid = preKey.every((key, index) => {
      const getType = tokenData.modelField[key];
      let dataValue;

      if (getType === "SingleFile") {
        dataValue =
          filesMap[key] && filesMap[key].length === 1
            ? filesMap[key][0]
            : undefined;
      } else if (getType === "MultiFile") {
        dataValue = filesMap[key] || [];
      } else {
        dataValue = req.body[key];
      }

      const isFormData =
        req.headers["content-type"] &&
        req.headers["content-type"].includes("multipart/form-data");

      if (getType === "String") {
        return typeof dataValue === "string";
      }
      if (getType === "Number") {
        if (isFormData) {
          // Convert to number for form-data
          const numberValue = Number(dataValue);
          if (!isNaN(numberValue)) {
            req.body[key] = numberValue; // Convert and store
            return true;
          }
          return false;
        }
        return typeof dataValue === "number";
      }
      if (getType === "Boolean") {
        const isFormData =
          req.headers["content-type"] &&
          req.headers["content-type"].includes("multipart/form-data");
        if (isFormData) {
          if (dataValue === "true") {
            req.body[key] = true;
            return true;
          }
          if (dataValue === "false") {
            req.body[key] = false;
            return true;
          }
          if (dataValue === "" || dataValue === undefined) {
            req.body[key] = false; // Default to false
            return true;
          }
          return false; // Invalid value for Boolean
        }
        return typeof dataValue === "boolean";
      }
      if (typeof dataValue === "boolean") {
        req.body[key] = dataValue; // Assign the Boolean value as-is
        return true;
      }
      if (getType === "Date") {
        if (isFormData) {
          // Convert to date for form-data
          const parsedDate1 = parse(dataValue, "yyyy-MM-dd", new Date());
          const parsedDate2 = parse(dataValue, "dd-MM-yyyy", new Date());
          if (isValidDate(parsedDate1)) {
            // Create a date without timezone adjustments
            req.body[key] = new Date(
              Date.UTC(
                parsedDate1.getFullYear(),
                parsedDate1.getMonth(),
                parsedDate1.getDate()
              )
            );
            return true;
          }
          if (isValidDate(parsedDate2)) {
            req.body[key] = new Date(
              Date.UTC(
                parsedDate2.getFullYear(),
                parsedDate2.getMonth(),
                parsedDate2.getDate()
              )
            );
            return true;
          }
          return false;
        }
        return Object.prototype.toString.call(dataValue) === "[object Date]";
      }
      if (getType === "SingleFile") {
        return dataValue !== undefined; // Ensure a single file is uploaded
      }
      if (getType === "MultiFile") {
        return dataValue.length > 0; // Ensure at least one file is uploaded
      }
      if (typeof getType === "string" && getType.startsWith("connect:")) {
        if (mongoose.Types.ObjectId.isValid(dataValue)) {
          req.body[key] = new mongoose.Types.ObjectId(dataValue); // Convert and store as ObjectId
          return true;
        }
        return false; // Invalid ObjectId
      }
      return false;
    });

    if (!isValid) {
      throw new Error("Validation Error");
    }
    if (
      checkFieldValue.includes("SingleFile") ||
      checkFieldValue.includes("MultiFile")
    ) {
      if (
        !req.headers["content-type"] ||
        !req.headers["content-type"].includes("multipart/form-data")
      ) {
        throw new Error(
          "Invalid Content-Type. You must use 'form-data' for uploading files."
        );
      } else {
        const databaseEntry = {}; // Object to store final database data

        // Validate and process text fields
        for (const key in req.body) {
          const value = req.body[key];

          // Allow `false` for Boolean fields and only throw errors for truly missing or empty values
          if (value === undefined || value === null || value === "") {
            if (tokenData.modelField[key] === "Boolean" && value === false) {
              continue; // Allow `false` for Boolean fields
            }
            throw new Error(`Field ${key} is empty. Please provide a value.`);
          }

          // Add the validated value to the database entry
          databaseEntry[key] = value;
        }

        // Array to store uploaded file URLs
        const uploadedImages = [];

        // Process uploaded files
        for (let file of req.files) {
          const fieldName = file.fieldname;

          // Validate file
          if (!file.path || file.path.trim() === "") {
            throw new Error(
              `File field ${fieldName} is empty. Please upload a file.`
            );
          }
          // console.log("Processing field:", fieldName); // Debugging log

          // Determine field type
          const fieldType = tokenData.modelField[fieldName]; // Get field type
          // console.log("Field type for", fieldName, "is", fieldType); // Debugging log

          // Upload file to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "uploads", // Specify folder in Cloudinary
          });

          // Save the Cloudinary URL
          const fileUrl = result.secure_url;
          uploadedImages.push(fileUrl); // Store URL for response/debugging

          // Store URLs in databaseEntry object based on field type
          if (fieldType === "SingleFile") {
            // For SingleFile, overwrite any existing value with the new URL
            databaseEntry[fieldName] = fileUrl;
          }
          if (fieldType === "MultiFile") {
            // For MultiFile, ensure the field is an array and append the new URL
            if (!databaseEntry[fieldName]) {
              databaseEntry[fieldName] = [];
            }
            databaseEntry[fieldName].push(fileUrl);
          }
        }

        // Save database entry with all fields and Cloudinary URLs
        const editData = await MD.findByIdAndUpdate(editId, {
          modelFieldData: databaseEntry,
        });
        if (!editData) throw new Error("Record Not Found");
        res.status(200).json({
          Status: "Success",
          Message: "Data Update Successfully",
          Data: databaseEntry,
        });
      }
    } else {
      const editData = await MD.findByIdAndUpdate(editId, {
        modelFieldData: req.body,
      });
      if (!editData) throw new Error("Record Not Found");
      res.status(200).json({
        Status: "Success",
        Message: "Data Update Successfully",
        Data: req.body,
      });
    }
  } catch (error) {
    res.status(404).json({
      Status: "Fail",
      Message: error.message,
    });
  }
};
