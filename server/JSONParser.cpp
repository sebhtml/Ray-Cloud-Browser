/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
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

#include "JSONParser.h"
#include "Mapper.h"

#include <iostream>
using namespace std;

#include <string.h>

int JSONParser::getType(){
	return m_type;
}

JSONParser::JSONParser(){
}

void JSONParser::parse(const char*file){

	m_mapper.enableReadOperations();

	char*content=(char*)m_mapper.mapFile(file);
	int start=0;
	int end=m_mapper.getFileSize()-1;

	create(JSONParser_TYPE_OBJECT,content,start,end);

	m_mapper.unmapFile();
}

void JSONParser::parseContent(){

	if(m_type==JSONParser_TYPE_OBJECT)
		parseObject();
	else if(m_type==JSONParser_TYPE_ARRAY)
		parseArray();
	else if(m_type==JSONParser_TYPE_STRING)
		parseString();
	else if(m_type==JSONParser_TYPE_INTEGER)
		parseInteger();
	else if(m_type==JSONParser_TYPE_DOUBLE)
		parseDouble();

}

void JSONParser::parseObject(){

	cout<<"[parseObject] "<<m_start<<" "<<m_end<<endl;

	int start=m_start;
	int end=m_end;

	while(m_content[start]!='{')
		start++;

	while(m_content[end]!='}')
		end--;

	start++;
	end--;

	while(start<=end){

// find the opening " for the key

		int findNextKey=start;

		while(m_content[findNextKey]!='"' && findNextKey<=end){
			findNextKey++;
		}

// no more keys
		if(m_content[findNextKey]!='"'){

			cout<<"[parseObject] no more keys"<<endl;

			break;
		}

		cout<<"[parseObject] findNextKey -> "<<findNextKey<<" "<<m_content[findNextKey]<<endl;
		cout<<"[parseObject] find key"<<endl;

		JSONParser key;

		pullString(&key,start);


// find the first non-white-space character

		int firstNextSymbol=key.getEnd();

		firstNextSymbol++;

// TODO: this code will work with "key"::: "Value" but should not
		while(m_content[firstNextSymbol]==' '||m_content[firstNextSymbol]=='\t'||m_content[firstNextSymbol]=='\n'
			|| m_content[firstNextSymbol]==':'){
			firstNextSymbol++;
		}

		cout<<"[parseObject] find value"<<endl;

		JSONParser value;
		
		pullContent(&value,firstNextSymbol);

		start=value.getEnd();

		start++;

// Skip the ','
// TODO: this code will work with "key",,,, but should not
		while(m_content[start]==' '||m_content[start]=='\t'||m_content[start]=='\n'
			|| m_content[start]==','){
			start++;
		}
	
		m_associativeKeyContent.push_back(key);
		m_associativeValueContent.push_back(value);
	}
}

void JSONParser::pullContent(JSONParser*node,int position){

	int firstNextSymbol=position;

	char nextSymbol=m_content[firstNextSymbol];

	if(nextSymbol=='"'){
		pullString(node,firstNextSymbol);
	}else if(nextSymbol=='{'){
		pullObject(node,firstNextSymbol);
	}else if(nextSymbol=='['){
		pullArray(node,firstNextSymbol);
	}else{
// TODO: this could also be a double
		pullInteger(node,firstNextSymbol);
	}

}

void JSONParser::pullString(JSONParser*node,int position){

	cout<<"[pullString] "<<position<<endl;

	int openingQuote=position;

	while(m_content[openingQuote]!='"')
		openingQuote++;

	int closingQuote=openingQuote;
	closingQuote++;

	while(m_content[closingQuote]!='"')
		closingQuote++;

	node->create(JSONParser_TYPE_STRING,m_content,openingQuote,closingQuote);
}

void JSONParser::pullObject(JSONParser*node,int position){

	int start=position;
	int activeBrackets=0;

	activeBrackets++;

	position++;

	while(activeBrackets!=0 && position<m_end){
		if(m_content[position]=='{'){
			activeBrackets++;
		}else if(m_content[position]=='}'){
			activeBrackets--;
		}

		position++;
	}

	node->create(JSONParser_TYPE_OBJECT,m_content,start,position);
}

void JSONParser::create(int type,const char*content,int start,int end){

	m_type=type;
	m_content=content;
	m_start=start;
	m_end=end;

	parseContent();
}

int JSONParser::getStart(){
	return m_start;
}

int JSONParser::getEnd(){
	return m_end;
}

void JSONParser::parseString(){


// TODO: 1000 is hard-coded !
	char content[1000];

	int length=(m_end-m_start+1-2);
	memcpy(content,m_content+m_start+1,length);

	content[length]='\0';
	m_stringContent=content;

	cout<<"[parseString] "<<m_start<<" "<<m_end<<" -> "<<"\""<<m_stringContent<<"\""<<endl;
}

void JSONParser::parseArray(){

	cout<<"[parseArray] "<<m_start<<" "<<m_end<<endl;

	int start=m_start;
	int end=m_end;

	while(m_content[start]!='[')
		start++;

	while(m_content[end]!=']')
		end--;

	start++;
	end--;

	while(start<=end){

// find the opening " for the key

		int findNextKey=start;

		while(m_content[findNextKey]!='{' && m_content[findNextKey]!='[' 
			&& m_content[findNextKey]!='"' && findNextKey<=end){

			findNextKey++;
		}

// no more keys
		if(m_content[findNextKey]!='{' && m_content[findNextKey]!='[' 
			&& m_content[findNextKey]!='"' ){

			cout<<"[parseObject] no more values"<<endl;

			break;
		}

		cout<<"[parseArray] findNextKey -> "<<findNextKey<<" "<<m_content[findNextKey]<<endl;


// find the first non-white-space character

		int firstNextSymbol=start;

		while(m_content[firstNextSymbol]==' '||m_content[firstNextSymbol]=='\t'
			||m_content[firstNextSymbol]=='\n'){

			firstNextSymbol++;
		}

		cout<<"[parseArray] find value"<<endl;

		JSONParser value;
		
		pullContent(&value,firstNextSymbol);

		start=value.getEnd();

		start++;

// Skip the ','
// TODO: this code will work with "key",,,, but should not
		while(m_content[start]==' '||m_content[start]=='\t'||m_content[start]=='\n'
			|| m_content[start]==','){
			start++;
		}
	
		m_arrayContent.push_back(value);
	}
}

void JSONParser::parseDouble(){
}

void JSONParser::parseInteger(){
}

void JSONParser::pullInteger(JSONParser*node,int start){
}

void JSONParser::pullArray(JSONParser*node,int position){

	int start=position;
	int active=0;

	active++;

	position++;

	while(active!=0 && position<m_end){
		if(m_content[position]=='['){
			active++;
		}else if(m_content[position]==']'){
			active--;
		}

		position++;
	}

	node->create(JSONParser_TYPE_ARRAY,m_content,start,position);
}

void JSONParser::debug(){

	print(0);
}

void JSONParser::print(int depth){

	if(m_type==JSONParser_TYPE_OBJECT){

		addSpaces(depth);
		cout<<"Type: Object"<<endl;

		for(int i=0;i<(int)m_associativeKeyContent.size();i++){
			addSpaces(depth);
			cout<<"Key "<<i<<endl;
			m_associativeKeyContent[i].print(depth+1);

			addSpaces(depth);
			cout<<"Value "<<i<<endl;
			m_associativeValueContent[i].print(depth+1);
		}
	}else if(m_type==JSONParser_TYPE_STRING){
		addSpaces(depth);
		cout<<"Type: String"<<" Value \""<<m_stringContent<<"\""<<endl;
	}else if(m_type==JSONParser_TYPE_ARRAY){

		addSpaces(depth);
		cout<<"Type: Array"<<endl;

		for(int i=0;i<(int)m_arrayContent.size();i++){
			addSpaces(depth);
			cout<<"Value "<<i<<endl;
			m_arrayContent[i].print(depth+1);

		}
	}
}

void JSONParser::addSpaces(int count){
	while(count--)
		cout<<"   ";
}
