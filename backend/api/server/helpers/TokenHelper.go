package helpers

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	AppConstant "github.com/HousewareHQ/backend-engineering-octernship/api/server/constants"
	"github.com/HousewareHQ/backend-engineering-octernship/api/server/models"
	DBconnect "github.com/HousewareHQ/backend-engineering-octernship/api/server/services"
	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SignedObject struct {
	Username  string
	Usertype  string
	Org       string
	ID        primitive.ObjectID
	CreatedAt time.Time
	UpdatedOn time.Time
	jwt.StandardClaims
}

// TODO:Add proper secret key
var SECRET_KEY = os.Getenv("MONGODB_CREDURL") //for simplicity purpose

// Generate access-token and refresh-token using JWT
func GenerateTokens(newUser models.User) (string, string) {
	//Storing user data in JWT along with expire time as claims
	//EXPIRY TIME-> JWT token:1hr ,refresh token :24hr
	claims := &SignedObject{
		Username:  newUser.Username,
		Usertype:  newUser.Usertype,
		Org:       newUser.Org,
		ID:        newUser.ID,
		CreatedAt: newUser.CreatedOn,
		UpdatedOn: newUser.UpdatedOn,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(AppConstant.TOKEN_EXPIRY).Unix(),
		},
	}

	//Creating refresh token ,storing only user's ID as claims
	refreshClaims := &SignedObject{
		ID: newUser.ID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Local().Add(AppConstant.REFRESH_TOKEN_EXPIRY).Unix(),
		},
	}
	//Creating JWT tokens using signing method algo and claims and then signing with secret key
	//NOTE:for simplicity purpose used mongodbCredentialURL as secretkey
	token, tErr := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(SECRET_KEY))
	refreshToken, rtErr := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString([]byte(SECRET_KEY))
	if tErr != nil || rtErr != nil {
		fmt.Println("Error while creating JWT token")
		log.Panic(tErr, rtErr)
		return "", ""
	}
	return token, refreshToken
}

/*tokens update on DB*/
func UpdateTokenOnLogin(token string, refreshToken string, uid primitive.ObjectID) *mongo.UpdateResult {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)

	//Update User details
	var updatedUser primitive.D
	currentTime, _ := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
	updatedUser = append(updatedUser, bson.E{Key: "jwttoken", Value: token})
	updatedUser = append(updatedUser, bson.E{Key: "refreshtoken", Value: refreshToken})
	updatedUser = append(updatedUser, bson.E{Key: "updatedon", Value: currentTime})

	userCollection := DBconnect.OpenCollection(DBconnect.Client, AppConstant.USER_COLLECTION) //MongoDBCollection

	/*Update document in MongoDB*/
	filter := bson.D{{Key: "_id", Value: uid}} //_id == uid documents will be effectedd
	opts := options.Update().SetUpsert(true)
	result, err := userCollection.UpdateOne(ctx, filter, bson.D{{Key: "$set", Value: updatedUser}}, opts)

	defer cancel()
	if err != nil {
		log.Panic(err.Error())
		return nil
	}
	return result

}

/*Validating access token*/
func ValidateJWTToken(jwtToken string) (claims *SignedObject, errMsg error) {
	var c, cancel = context.WithTimeout(context.Background(), 10*time.Second)
	errMsg = nil
	//retrieving claims using provided token
	token, err := jwt.ParseWithClaims(
		jwtToken,
		&SignedObject{},
		func(t *jwt.Token) (interface{}, error) {
			return []byte(SECRET_KEY), nil
		},
	)
	defer cancel()
	if err != nil {
		errMsg = err
		return nil, errMsg
	}
	defer cancel()
	claims, valid := token.Claims.(*SignedObject) //type assertion that Claims contains concrete SignedObject Value
	if !valid {                                   //if not valid token
		errMsg = errors.New("TOKEN IS NOT VALID")
		return nil, errMsg
	}
	defer cancel()

	//Token Expiry Validation
	if claims.ExpiresAt < time.Now().Local().Unix() {
		errMsg = errors.New("token expired-try login again")
		return nil, errMsg
	}

	//Fetching user document using claims,in order to check whether user exists or not {id}
	userCollection := DBconnect.OpenCollection(DBconnect.Client, AppConstant.USER_COLLECTION)
	filter := bson.D{{Key: "_id", Value: claims.ID}}
	res := userCollection.FindOne(c, filter)
	var foundUser models.User
	res.Decode(&foundUser)
	/*foundUser's username field will be empty ,
	if user no longer exists in DB */
	defer cancel()
	if foundUser.Username == "" {
		//User doesnot exist
		errMsg = errors.New("user no longer exists")
		return nil, errMsg
	}

	//Returning claims(Information in token) and error message if any
	return claims, errMsg

}

// To generate new tokens by provided refresh token
func GenerateTokenByRefreshToken(c context.Context, refreshToken string) (newAccessToken string, newRefreshToken string, err error) {
	//Retrieving claims from provided refresh token
	rToken, err := jwt.ParseWithClaims(refreshToken,
		&SignedObject{},
		func(t *jwt.Token) (interface{}, error) {
			return []byte(SECRET_KEY), nil
		},
	)
	claims := rToken.Claims.(*SignedObject)

	//Fetching user document using claims {id}
	userCollection := DBconnect.OpenCollection(DBconnect.Client, AppConstant.USER_COLLECTION)
	filter := bson.D{{Key: "_id", Value: claims.ID}}
	res := userCollection.FindOne(c, filter)
	var foundUser models.User
	res.Decode(&foundUser)
	/*foundUser's username field will be empty ,
	if user no longer exists in DB */

	if foundUser.Username == "" {
		//User doesnot exist
		err = errors.New("user no longer exists")
	}

	//Generate new tokens
	newAccessToken, newRefreshToken = GenerateTokens(foundUser)
	//Update user tokens in DB
	UpdateTokenOnLogin(newAccessToken, newRefreshToken, foundUser.ID)
	return newAccessToken, newRefreshToken, err

}
