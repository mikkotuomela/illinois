# Script to extract usernames from tweets

# x 1 = kd
#   2 = kesk
# x 3 = kok
#   4 = ps
# x 5 = r
# x 6 = sd
# x 7 = vas
# x 8 = vihr
#   9 = muutos2011
#   10 = vr


use strict;
use Text::CSV_XS;
use Data::Dumper;

use constant MPS_FILE => 'mps.csv';
use constant DLFILE   => 'links_dl.txt';
use constant CSVFILE  => 'links.csv';
 
main();

# Main program
sub main {
	my $total = 0;
	my $mps   = get_mps(MPS_FILE);
	my $all   = [];
	
	# Loop through all MPs
	foreach my $mp (keys %$mps) {
		next unless -e "tweets/$mp.csv";
		my $links = get_tweets($mp, $mps);
		my $n     = scalar(@$links);
		push @$all, @$links if $n > 0;
		$total += $n;
	}
	
	# Add weight for followers
	my $links      = {};
	my $partylinks = {};
	my $n          = 0;
	# Loop through all MPs
	foreach my $mp (keys %$mps) {
		# Loop through all followers for given MP
		foreach my $other_mp (@{$mps->{$mp}{friends}}) {
		
			# If the follower is also an MP, add link
			next unless grep(/$other_mp/, keys %$mps);
			$links->{get_linkname($mp, $other_mp)} = 1;
			
			# Same for groups
			my $party1 = $mps->{$mp}{group};
			my $party2 = $mps->{$other_mp}{group};
			$partylinks->{get_linkname($party1, $party2)} = 1
				if $party1 ne $party2;
				
			$n++;
			
		}
	}
	
	# Create link hash
	foreach my $row (@$all) {
		my $linkname = get_linkname(@$row);
		$n++ unless exists $links->{$linkname};
		$links->{$linkname} += 2;
		
		# Same for groups
		my $party1 = $mps->{$row->[0]}{group};
		my $party2 = $mps->{$row->[1]}{group};
		$partylinks->{get_linkname($party1, $party2)} += 2
			if $party1 ne $party2;
		
	}
	write_dl($links, DLFILE);
	write_csv($links, CSVFILE);
	write_csv($partylinks, 'partylinks.csv');
	
	print "Total number of links: $n\n";
	my $consolidated = scalar(keys %$links);
	print "Total consolidated links: $consolidated\n";
	my $partylinks_n = scalar(keys %$partylinks);
	print "Total party links: $partylinks_n\n";
	
}

# Write results to dl file
sub write_dl {
	my ($links, $filename) = @_;
	print "Writing DL file...\n";
	open (my $out, '>', $filename) or die "$!";
	print $out "DL n=" . scalar(keys %$links) . "\n";
	print $out "format=edgelist1\n";
	print $out "labels embedded:\ndata:\n";
	foreach my $link (sort keys %$links) {
		print $out $link . ' ' . $links->{$link} . "\n";
	}
	close($out);
}

# Write results to csv file
sub write_csv {
	my ($links, $filename) = @_;
	print "Writing CSV...\n";
	open (my $out, '>', $filename) or die "$!";
	foreach my $link (sort keys %$links) {
		my $csvrow = $link;
		$csvrow    =~ s/\ /\,/;
		$csvrow   .= ",$links->{$link}\n";
		print $out $csvrow;
	}
	close($out);
}

sub get_linkname {
	my ($mp1, $mp2) = @_;
	return join(' ', sort ($mp1, $mp2));
}

# Get all tweets for given MP
sub get_tweets {

	my ($mp, $mps) =  @_;
	my $csv        = Text::CSV_XS->new({ binary => 1 });
	my $links      = [];
	
	# Open tweets for given MP
	open(my $fh, "tweets/$mp.csv") or die "$!";
	my $headers = $csv->getline($fh);
	print "Processing $mp...\n";
	
	# Loop through all tweets 
	while (not $csv->eof()) {
		my $row   = $csv->getline($fh);
		my $text  = lc($row->[1]); # Tweet text

		# Find all mentions of other Twitter users (starts with @)
		while ($text =~ m/\@(.*?)[\s|\!|\#|\:|\-|\@|\*|\(|\)|\.|\,]/g ) { 
		
			my $username = $1;
			next if $mp eq $username or $mp eq 'eerohei';

			# Check against all other MPs
			foreach my $other_mp (keys %$mps) {
				next if $other_mp ne $username or $other_mp eq 'eerohei';
				push @$links, [$mp, $username];
			}
			
		}
		
	}
	close($fh);
	my $n = scalar(@$links);
	print "Total: $n links\n" if $n > 0;
	return $links;
}

# Get list of MPs
sub get_mps {
	my ($filename) = @_;
	my $csv     = Text::CSV_XS->new({ binary => 1 });
	
	# Open file and get headers
	open(my $fh, $filename) or die "$!";
	my $headers = $csv->getline($fh);
	my $data    = {};
	
	# Loop through all lines
	while (not $csv->eof()) {
	
		my $row        = $csv->getline($fh);
		my $screenname = $row->[3];
		next unless $screenname;
		
		my $friends = get_friends($screenname);
		
		my $mp      = {
			last       => $row->[0],
			first      => $row->[1],
			group      => $row->[2],
			processed  => $row->[4],
			friends    => $friends,
		};
		# Only add to the list if this MP has twitter account 
		$data->{$screenname} = $mp;
		
	}
	close($fh);
	return $data;
}

sub get_friends {
	my ($username) = @_;
	my $csv        = Text::CSV_XS->new({ binary => 1 });
	my $friendfile = "tweets/$username" . "_friends.csv";
	return [] unless -e $friendfile;
	
	# Open file
	my $friends = [];
	open (my $fr, $friendfile) or die "$!";
	my $headers = $csv->getline($fr);
	
	# Loop through all rows
	while (not $csv->eof()) {
		my $row        = $csv->getline($fr);
		my $friendname = $row->[1];
		next if $friendname eq 'eerohei' or $friendname eq 'niinisto' or
				$friendname eq 'fia'     or $friendname eq 'jyri' or
				$friendname eq 'mikko'   or $friendname eq 'tuija' or
				$friendname eq 'turunen';
		push @$friends, $friendname if $friendname ne '';
	}
	close($fr);
	print "$username has " . scalar(@$friends) . " friends.\n";
	return $friends;
}

1;