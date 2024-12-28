# LIS 590 NA: Network Analysis
# Course project
# Mikko Tuomela <mstuomel@illinois.edu>

require(ROAuth)
require(twitteR)
require(stringr)
require(tm)

# Set working directory
setwd("C:\\Users\\Mikko Tuomela\\Dropbox\\Courses\\LIS 590 NA Network Analysis\\Assignments\\Project")

# Get Twitter credentials
GetCred <- function() {
    print("Creating Twitter credentials...")

    # Parameters for Twitter app
    requestURL     <- "https://api.twitter.com/oauth/request_token"
    accessURL      <- "https://api.twitter.com/oauth/access_token"
    authURL        <- "https://api.twitter.com/oauth/authorize"
    consumerKey    <- ""
    consumerSecret <- ""
    
    # Create credentials object
    cred <- OAuthFactory$new(consumerKey    = consumerKey,
                             consumerSecret = consumerSecret,
                             requestURL     = requestURL,
                             accessURL      = accessURL,
                             authURL        = authURL)
    
    # Download certificate and register Twitter authentication
    print("Downloading certificate...")
    download.file(url = "http://curl.haxx.se/ca/cacert.pem", destfile = "cacert.pem")						 
    cred$handshake(cainfo = "cacert.pem")
    registerTwitterOAuth(cred)
    save(cred, file = "credentials.RData")
    print("Credentials created and saved.")
}

# Get tweets and return a data frame
GetTweets <- function() {
    print("Looking for tweets...")
    tweetList <- searchTwitter("#climate", n = 10, cainfo = "cacert.pem")
    tweetDF   <- do.call("rbind", lapply(tweetList, as.data.frame))
    print(paste(length(tweetList), "tweets downloaded."))
    return(tweetDF)
}

# Get tweets from a single user
GetUserTweets <- function(user, max_n) {
    print("Looking for tweets...")
    tweetList <- userTimeline(user = user, n = max_n, cainfo = "cacert.pem")
    tweetDF   <- do.call("rbind", lapply(tweetList, as.data.frame))
    print(paste(length(tweetList), "tweets downloaded."))
    return(tweetDF)
}

main <- function() {
    
    # Get Twitter credentials
    #GetCred() # only if needed
    print("Loading Twitter credentials...")
    load("credentials.RData")
    registerTwitterOAuth(cred)
    print("Twitter credentials loaded.")
    
    # Search and download tweets
    mps <- read.csv(file = "mps.csv", sep = ",")
    for (mp_i in 1:nrow(mps)) {
        mp       <- mps[mp_i, ]
        username <- mp$screenname
        if (username == "" || mp$processed == "x") next # no twitter account?

        print(paste("Now processing", username, sep = " "))
        tweetDF <- GetUserTweets(username, 3200)
        write.csv(file = paste(username, ".csv", sep = ""), x = tweetDF)
    }
    print("Finished.")
    
}

# Run the main program
main()