<?php
/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012  Sébastien Boisvert
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

//header("Content-Type: application/json")

/*
 * Columns in table objects:
 * object, coverage, parents, children
 */

$messageTag=$_GET['messageTag'];
$requestedObject=$_GET['object'];

if($messageTag=="RAY_HTTP_TAG_GET_KMER_INFORMATION"){
	echo("{");
	echo("    \"messageTag\": \"RAY_HTTP_TAG_GET_KMER_INFORMATION_REPLY\",");
	echo("    \"object\": \"".$requestedObject."\",");

	$graphFile="../../../payload/kmers.sqlite";
	$database=new PDO("sqlite:".$graphFile);
	$result=$database->query("select * from objects where object='$requestedObject'");
	
	$found=false;

	foreach($result as $row){
		$found=true;
		$coverage=$row['coverage'];
		$parents="";
		$childrens="";

		echo("    \"found\": true,");
		echo("    \"coverage\": 123,");
		echo("    \"parents\": [ \"A\", \"T\" ],");
		echo("    \"children\": [ \"G\", \"C\" ]");
	}

	if(!$found)
		echo("    \"found\": false,");
	}
	echo("}");
}

?>
