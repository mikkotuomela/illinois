// Modifications for Nature front page
// http://www.nature.com

// Add more Nature Regions
j('ul.plain:contains("Asia-Pacific")').prepend('<li><a href="http://www.ats.aq/">Antarctica</a></li>')
j('ul.plain:contains("Asia-Pacific")').prepend('<li><a href="http://www.suomi.fi/">Finland</a></li>')

// Add nyan message to all headings and anchors
j('h1,h2,h3,h4,h5,h6,a').append('nyan!')

// Change newest issue into Cosmopolitan
j('li.cover-link').css('background-image', 'url("http://www.redcarpetqueen.com/media/Media/Red_Carpet_Queen_Cosmopolitan_2012_April_Cover-small.jpg")')

// Change main pic into Nyan Cat
j('h3 a span img').attr('src', 'http://imgs.tuts.dragoart.com/how-to-draw-pop-tart-cat-nyan-cat_1_000000008932_5.jpg')
j('h3 a span img').attr('width', 200)
j('cite.pic-credit').text('U MAD?')

// Change background into animated Nyan Cat
j('body').css('background-image', 'url("http://www.nyan.cat/cats/original.gif")')
j('body').css('background-repeat', 'repeat')
j('ul.xoxo').css('background-color', 'white') // add for text boxes



// Modifications for ARTS 445 project 3 instructions
// http://arts445.courses.bengrosser.com/projects/#add

// New examples

j('p:contains("Scare") strong:contains("Examples")').after('<br><a href="http://mikko.tuomela.net/party/">Dance party generator</a> by Mikko - another great project by him')
j('p:contains("Scare") strong:contains("Examples")').after('<br><a href="http://mikko.tuomela.net/deitti/">DeittiMesta</a> - awesome fake dating site by my best student Mikko!')
j('p:contains("Scare") strong:contains("Examples")').after('<br><a href="http://www.umich.edu">University of Michigan</a> - the best university in the world - Mikko went there! Go Blue!!! &hearts;')
j('p:contains("Scare") strong:contains("Examples")').after('<img src="http://web.eecs.umich.edu/~parikh/style/umich_logo.jpg" width="150" alt="" style="float:right">')

// New technologies
j('p:contains("Technologies"):not(:contains("Userscripts")):not(:contains("HTML")) strong:contains("Technologies")').after('<br><img src="http://static2.wikia.nocookie.net/__cb20130825005610/agk/images/c/cb/Clippy.png" width="150" alt="" style="float:right">Clippy<br>Visual Basic<br>Intel 8051 assembly language')

// Addition to instructions
j('p:contains("This time")').append(' However, I must warn ya - it\'ll be hard without a PhD degree and years of research experience')
j('p:contains("Because your additions")').prepend('Feel free to completely ignore this paragraph: ')
j('a:contains("See my post on")').append(' - it might work, but frankly I\'m not so sure')
