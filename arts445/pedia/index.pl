#!/usr/bin/perl -wT

use strict;
use warnings;
use File::Slurp;
use CGI qw(:standard);
use constant DEFAULT_TITLE => 'Wikipedia';

my $links = [
	'Wikipedia', 'Conservapedia',
	'University of Illinois at Urbana-Champaign', 'Illinois',
	'Creationism', 'Climate change', 'Barack Obama', 'Theory of relativity',
	'Liberal', 'ObamaCare', 'Homosexual agenda', 'Feminism', 'Condom',
	'Korean Air Lines Flight 007', 'Family Guy', 'Global flood',
	'Planned Parenthood'
	];

# Get template page and title
my $file  = read_file('page.html');
my $title = param('title');
$title = DEFAULT_TITLE unless $title;

if (length($title) > 50) {
	$title = substr($title, 0, 50);
}
$title =~ s/[\<\>\"\'\\\/\;]//g;

# Assemble URLs
my $conserva = 'http://www.conservapedia.com/?printable=yes&amp;title=';
$conserva .= $title;
my $wiki     = 'http://en.wikipedia.org/w/index.php?printable=yes&amp;title=';
$wiki     .= $title;

# Create links
my $link_html = '';
foreach my $link (@$links) {
	my $url_link = $link;
	$url_link    =~ s/\ /%20/g;
	$link_html  .= '<a href="http://mikko.tuomela.net/ui/arts445/pedia/?title=';
	$link_html  .= $url_link;
	$link_html  .= '">' . $link . '</a> ';
}

# Insert stuff into template
$file =~ s/%TITLE%/$title/;
$file =~ s/%LINKS%/$link_html/;
$file =~ s/%CONSERVA%/$conserva/;
$file =~ s/%WIKI%/$wiki/;

# Output page
print "Content-type: text/html\n\n";
print $file;
