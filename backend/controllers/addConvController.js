const User = require("../model/userlogin");

exports.addConv = async(req, res) => {
  try {
    const { username } = req.params;
    const { convID } = req.body;
  
    if (!convID || !username) {
      return res.status(400).json({ message: 'Missing required fields.'});
    }
    const user = await User.findOne({ username });
    
    if(!user) {
      return res.status(404).json({ message: 'user not found.'});
    }
    user.convos.push(convID);

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
  }
}

exports.fetchUser = async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ message: 'username is required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
