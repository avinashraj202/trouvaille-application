const express = require("express");
const Query = require("../../../config/db");
const _ = require("lodash");
const { ErrorHandler, statusCodes } = require("../../../helper");
// const User = require("./user");
const { BAD_GATEWAY } = statusCodes;

async function getPosts(posts, u_id) {
  var responseArray = [];

  const responses = posts.map(async (value) => {
    const { post_id, user_id, caption, url, type, time, user_name, dp } = value;
    const tags = await Query(
      "SELECT  p.tag_name from `pre_tags` p INNER JOIN tags t WHERE t.tag_id = p.tag_id AND t.post_id = ?",
      [post_id]
    );
    const tagPeople = await Query(
      "SELECT u.user_name, u.user_id FROM `user_details` u INNER JOIN `tag_people` t WHERE t.user_id = u.user_id AND t.post_id = ?",
      [post_id]
    );
    let commentCount = await Query(
      "SELECT count(*) as total FROM `comments` WHERE `post_id` = ?",
      [post_id]
    );
    let likeCount = await Query(
      "SELECT * FROM `post_like` WHERE `post_id` = ?",
      [post_id]
    );
    
    commentCount = commentCount[0].total;
    let isLiked =
      likeCount.find((v, i) => v.user_id === u_id) == null ? false : true;
    likeCount = likeCount.length;
    const response = {
      post_id,
      user_id,
      user_name,
      dp,
      caption,
      url,
      type,
      time,
      tags,
      tagPeople,
      isLiked,
      commentCount,
      likeCount,
    };
    responseArray.push(response);
  });
  await Promise.all(responses);
  return responseArray;
}
class GetPost {
  constructor() {}

  async mePosts(req, res) {
    try {
      const { _id } = req.user;
      const posts = await Query(
        "SELECT p.*, u.user_name, u.dp FROM `posts` p INNER JOIN `user_details` u ON p.user_id = u.user_id WHERE p.user_id = ? AND p.status = '1'  ORDER BY time DESC",
        [_id]
      );
      const response = await getPosts(posts, _id);
      return response;
    } catch (err) {
      throw new ErrorHandler(BAD_GATEWAY, err);
    }
  }

  async userPosts(req, res) {
    try {
      const { id } = req.body;
      const { _id } = req.user;
      const posts = await Query(
        "SELECT p.*, u.user_name, u.dp FROM `posts` p INNER JOIN `user_details` u ON p.user_id = u.user_id WHERE p.user_id = ? AND p.status = '1'  ORDER BY time DESC",
        [id]
      );
      const response = await getPosts(posts, _id);
      return response;
    } catch (err) {
      throw new ErrorHandler(BAD_GATEWAY, err);
    }
  }

  async homePosts(req, res) {
    try {
      const { _id } = req.user;
      let { coordinates, radiusId, followingId, postsId } = req.body;

      if (radiusId === 0) {
        const response = await Query(
          "SELECT post_id FROM `posts`  ORDER BY time DESC LIMIT 1"
        );
        followingId = response[0].post_id;
        radiusId = response[0].post_id;
      }

      let latitude, longitude, radius;
      const userDetails = await Query(
        "SELECT `latitude`, `longitude`, `radius`, `interests` from `user_details` WHERE `user_id` = ?",
        [_id]
      );
      radius = userDetails[0].radius;
      const userInterests = JSON.parse(userDetails[0].interests);

      if (coordinates.length === 0) {
        latitude = userDetails[0].latitude;
        longitude = userDetails[0].longitude;
      } else {
        latitude = coordinates.latitude;
        longitude = coordinates.longitude;
      }

      const radiusPostIds = `(${postsId.toString()})`;
      let checkIds = [],
        updatedrposts = [];
      const rposts = await Query(
        `SELECT p.*, u.user_name, u.dp, 6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(? - ABS(u.latitude))), 2) + COS(RADIANS(?)) * COS(RADIANS(ABS(u.latitude))) * POWER(SIN(RADIANS(? - u.longitude)), 2))) AS distance FROM posts p INNER JOIN user_details u ON p.user_id = u.user_id WHERE p.user_id != ? AND p.status = '1' AND p.post_id <= ? AND p.post_id NOT IN ${radiusPostIds} HAVING distance < ? ORDER BY time DESC LIMIT 30`,
        [latitude, latitude, longitude, _id, radiusId, radius]
      );
      const checkForInterests = rposts.map(async (v) => {
        const userId = v.user_id;
        if (checkIds.includes(userId)) {
          updatedrposts.push(v);
        } else {
          checkIds.push(userId);
          const checkResponse = await Query(
            "SELECT `interests` from `user_details` WHERE `user_id` = ?",
            [userId]
          );
          if(checkResponse[0].interests)
          {
            let nearUserInterests = JSON.parse(checkResponse[0].interests);
            let commonIntersts = nearUserInterests.filter((x) =>
              userInterests.includes(x)
            );
            if (commonIntersts.length != 0) {
              updatedrposts.push(v);
            }
          }
        }
      });

      await Promise.all(checkForInterests);

      if (updatedrposts.length != 0) {
        updatedrposts.map((v) => postsId.push(v.post_id));
        radiusId = updatedrposts[0].post_id;
      }

      const followingPostIds = `(${postsId.toString()})`;
      const followingPosts = await Query(
        `SELECT p.*, u.user_name, u.dp FROM posts p INNER JOIN followers f ON f.following = p.user_id INNER JOIN user_details u ON u.user_id=p.user_id AND p.status = 1 AND p.user_id != ? AND p.post_id <= ? AND p.post_id NOT IN ${followingPostIds} AND f.follower = ? ORDER BY time DESC LIMIT 30`,
        [_id, followingId, _id]
      );
      if (followingPosts.length != 0) {
        followingPosts.map((v) => postsId.push(v.post_id));
        followingId = followingPosts[0].post_id;
      }

      let totalPosts = [...updatedrposts, ...followingPosts];
      totalPosts.sort((a, b) => new Date(b.time) - new Date(a.time));

      const followersRes = await getPosts(totalPosts, _id);
      let isEnd = false;
      if (followingPosts.length == 0 && updatedrposts.length == 0) isEnd = true;

      let data = {
        followersRes,
        radiusId,
        followingId,
        postsId,
        isEnd,
      };
      return data;
    } catch (err) {
      throw new ErrorHandler(BAD_GATEWAY, err);
    }
  }

  async allPosts(req, res) {
    try {
      const { _id } = req.user;
      let { tagIds } = req.body;
      tagIds = `(${tagIds.toString()})`;
      let posts = await Query(
        `SELECT DISTINCT p.*, u.user_name, u.dp FROM posts p INNER JOIN user_details u ON p.user_id = u.user_id INNER JOIN tags t ON t.post_id = p.post_id WHERE p.status = '1' AND t.tag_id IN ${tagIds} AND p.user_id != ? ORDER BY time DESC`,
        [_id]
      );
      let response = await getPosts(posts, _id);

      return { ...response };
    } catch (err) {
      throw new ErrorHandler(BAD_GATEWAY, err);
    }
  }
}

module.exports = GetPost;
