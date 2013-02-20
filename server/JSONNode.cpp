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

#include "JSONNode.h"

#include <iostream>
#include <sstream>
using namespace std;

#include <string.h>

#ifdef CONFIG_ASSERT
#include <assert.h>
#endif

int JSONNode::getType()const{
	return m_type;
}

JSONNode::JSONNode(){
	m_debug=false;
}

void JSONNode::parseContent(){

	if(m_type==JSONNode_TYPE_OBJECT)
		parseObject();
	else if(m_type==JSONNode_TYPE_ARRAY)
		parseArray();
	else if(m_type==JSONNode_TYPE_STRING)
		parseString();
	else if(m_type==JSONNode_TYPE_INTEGER)
		parseInteger();
	else if(m_type==JSONNode_TYPE_DOUBLE)
		parseDouble();
}

void JSONNode::parseObject(){

	if(m_debug)
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

			if(m_debug)
				cout<<"[parseObject] no more keys"<<endl;

			break;
		}

		if(m_debug){
			cout<<"[parseObject] findNextKey -> "<<findNextKey<<" "<<m_content[findNextKey]<<endl;
			cout<<"[parseObject] find key"<<endl;
		}

		JSONNode key;

		pullString(&key,start);


// find the first non-white-space character

		int firstNextSymbol=key.getEnd();

		firstNextSymbol++;

// TODO: this code will work with "key"::: "Value" but should not
		while(m_content[firstNextSymbol]==' '||m_content[firstNextSymbol]=='\t'||m_content[firstNextSymbol]=='\n'
			|| m_content[firstNextSymbol]==':'){
			firstNextSymbol++;
		}

		if(m_debug)
			cout<<"[parseObject] find value"<<endl;

		JSONNode value;
		
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

void JSONNode::pullContent(JSONNode*node,int position){

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

void JSONNode::pullString(JSONNode*node,int position){

	if(m_debug)
		cout<<"[pullString] "<<position<<endl;

	int openingQuote=position;

	while(m_content[openingQuote]!='"')
		openingQuote++;

	int closingQuote=openingQuote;
	closingQuote++;

	while(m_content[closingQuote]!='"')
		closingQuote++;

	node->create(JSONNode_TYPE_STRING,m_content,openingQuote,closingQuote);
}

void JSONNode::pullObject(JSONNode*node,int position){

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

	node->create(JSONNode_TYPE_OBJECT,m_content,start,position);
}

void JSONNode::create(int type,const char*content,int start,int end){

	m_type=type;
	m_content=content;
	m_start=start;
	m_end=end;

	parseContent();
}

int JSONNode::getStart()const{
	return m_start;
}

int JSONNode::getEnd()const{
	return m_end;
}

void JSONNode::parseString(){


// TODO: 1000 is hard-coded !
	char content[1000];

	int length=(m_end-m_start+1-2);
	memcpy(content,m_content+m_start+1,length);

	content[length]='\0';
	m_stringContent=content;

	if(m_debug)
		cout<<"[parseString] "<<m_start<<" "<<m_end<<" -> "<<"\""<<m_stringContent<<"\""<<endl;
}

void JSONNode::parseArray(){

	if(m_debug)
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

		while(!isDigitSymbol(m_content[findNextKey])
			&& m_content[findNextKey]!='{' && m_content[findNextKey]!='[' 
			&& m_content[findNextKey]!='"' && findNextKey<=end){

			findNextKey++;
		}

// no more keys
		if(!isDigitSymbol(m_content[findNextKey])
			&& m_content[findNextKey]!='{' && m_content[findNextKey]!='[' 
			&& m_content[findNextKey]!='"' ){

			if(m_debug)
				cout<<"[parseObject] no more values"<<endl;

			break;
		}

		if(m_debug)
			cout<<"[parseArray] findNextKey -> "<<findNextKey<<" "<<m_content[findNextKey]<<endl;


// find the first non-white-space character

		int firstNextSymbol=start;

		while(m_content[firstNextSymbol]==' '||m_content[firstNextSymbol]=='\t'
			||m_content[firstNextSymbol]=='\n'){

			firstNextSymbol++;
		}

		if(m_debug)
			cout<<"[parseArray] find value"<<endl;

		JSONNode value;
		
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

// TODO: to be implemented.
void JSONNode::parseDouble(){
}

void JSONNode::parseInteger(){


// TODO: 1000 is hard-coded !
	char content[1000];

	int length=(m_end-m_start+1);
	memcpy(content,m_content+m_start,length);

	content[length]='\0';

	if(m_debug)
		cout<<"[parseInteger] "<<m_start<<" "<<m_end<<" Content -> "<<content<<endl;

	istringstream buffer(content);

	buffer>>m_integerContent;

	if(m_debug)
		cout<<"[parseInteger] "<<m_start<<" "<<m_end<<" -> "<<m_integerContent<<endl;
}

void JSONNode::pullInteger(JSONNode*node,int start){

	if(m_debug)
		cout<<"[pullInteger] "<<start<<endl;

	int beginning=start;
	
	int theEnd=beginning;

	while(isDigitSymbol(m_content[theEnd]))
		theEnd++;

	theEnd--;

	node->create(JSONNode_TYPE_INTEGER,m_content,beginning,theEnd);
}

void JSONNode::pullArray(JSONNode*node,int position){

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

	node->create(JSONNode_TYPE_ARRAY,m_content,start,position);
}

void JSONNode::debug(){
	m_debug=!m_debug;
}

void JSONNode::print(int depth)const{

	if(m_type==JSONNode_TYPE_OBJECT){

		addSpaces(&cout,depth);
		cout<<"Type: Object"<<endl;

		for(int i=0;i<(int)m_associativeKeyContent.size();i++){

#ifdef CONFIG_ASSERT
			assert(m_associativeKeyContent.size()==m_associativeValueContent.size());
#endif

			addSpaces(&cout,depth);
			cout<<"Key "<<i<<endl;
			m_associativeKeyContent[i].print(depth+1);

			addSpaces(&cout,depth);
			cout<<"Value "<<i<<endl;
			m_associativeValueContent[i].print(depth+1);
		}
	}else if(m_type==JSONNode_TYPE_STRING){
		addSpaces(&cout,depth);
		cout<<"Type: String"<<" Value \""<<m_stringContent<<"\""<<endl;
	}else if(m_type==JSONNode_TYPE_INTEGER){
		addSpaces(&cout,depth);
		cout<<"Type: Integer"<<" Value "<<m_integerContent<<endl;
	}else if(m_type==JSONNode_TYPE_ARRAY){

		addSpaces(&cout,depth);
		cout<<"Type: Array"<<endl;

		for(int i=0;i<(int)m_arrayContent.size();i++){
			addSpaces(&cout,depth);
			cout<<"Value "<<i<<endl;
			m_arrayContent[i].print(depth+1);
		}
	}
}

void JSONNode::addSpaces(ostream*output,int count)const{
	string content="  ";
	while(count--)
		(*output)<<content;
}

bool JSONNode::isDigitSymbol(char symbol)const{
// TODO: don't allow '-' inside a number
	if(
	symbol=='-'
	||symbol=='0'
	||symbol=='1'
	||symbol=='2'
	||symbol=='3'
	||symbol=='4'
	||symbol=='5'
	||symbol=='6'
	||symbol=='7'
	||symbol=='8'
	||symbol=='9')
		return true;

	return false;
}

int64_t JSONNode::getInteger()const{
	return m_integerContent;
}

const char*JSONNode::getString()const{
	return m_stringContent.c_str();
}

const JSONNode*JSONNode::getArrayElement(int index)const{
	return &(m_arrayContent[index]);
}

JSONNode*JSONNode::getArrayMutableElement(int index){
	return &(m_arrayContent[index]);
}

const JSONNode*JSONNode::getObjectKey(int index)const{
	return &(m_associativeKeyContent[index]);
}

JSONNode*JSONNode::getObjectMutableValue(int index){
	return &(m_associativeValueContent[index]);
}

const JSONNode*JSONNode::getObjectValue(int index)const{
	return &(m_associativeValueContent[index]);
}

int JSONNode::getArraySize()const{
	return m_arrayContent.size();
}

int JSONNode::getObjectSize()const{
	return m_associativeKeyContent.size();
}

void JSONNode::destroy(){

	m_associativeKeyContent.clear();
	m_associativeValueContent.clear();
	m_arrayContent.clear();
	m_stringContent.clear();

	m_type=JSONNode_TYPE_NULL;
}

JSONNode*JSONNode::getObjectMutableValueForKey(const char*key){
	int keys=getObjectSize();
	int match=0;

	for(int i=0;i<keys;i++){
		const char*keyValue=getObjectKey(i)->getString();

		if(strcmp(keyValue,key)==match){
			return getObjectMutableValue(i);
		}
	}

	return NULL;
}

const JSONNode*JSONNode::getObjectValueForKey(const char*key)const{
	int keys=getObjectSize();
	int match=0;

	for(int i=0;i<keys;i++){
		const char*keyValue=getObjectKey(i)->getString();

		if(strcmp(keyValue,key)==match){
			return getObjectValue(i);
		}
	}

	return NULL;
}

void JSONNode::setType(int type){
	m_type=type;
}

void JSONNode::addObjectKeyAndValue(JSONNode*key,JSONNode*value){
	m_associativeKeyContent.push_back(*key);
	m_associativeValueContent.push_back(*value);
}

void JSONNode::setString(const char*value){
	m_stringContent=value;
}

void JSONNode::write(ostream*output)const{
	writeObject(output,0,true);
}

void JSONNode::writeObject(ostream*output,int depth,bool addIndentation)const{

	if(m_type==JSONNode_TYPE_OBJECT){

		if(addIndentation)
			addSpaces(output,depth);
		else
			(*output)<<" ";
		(*output)<<"{";

		for(int i=0;i<(int)m_associativeKeyContent.size();i++){
			if(addIndentation)
				addSpaces(output,depth);

			bool useIndentation=true;
			m_associativeKeyContent[i].writeObject(output,depth+1,useIndentation);

			(*output)<<" :";

			m_associativeValueContent[i].writeObject(output,depth+1,false);

			if(i!=(int)m_associativeValueContent.size()-1)
				(*output)<<",";
		}

		addIndentation=false;

		if(addIndentation)
			addSpaces(output,depth);
		else
			(*output)<<" ";
		(*output)<<"}";

	}else if(m_type==JSONNode_TYPE_STRING){
		if(addIndentation){
			(*output)<<endl;
			addSpaces(output,depth+1);
		}
		(*output)<<"\""<<m_stringContent<<"\"";
	}else if(m_type==JSONNode_TYPE_INTEGER){
		if(addIndentation){
			(*output)<<endl;
			addSpaces(output,depth+1);
		}
		(*output)<<m_integerContent;
	}else if(m_type==JSONNode_TYPE_ARRAY){

		if(addIndentation)
			addSpaces(output,depth);
		else
			(*output)<<" ";
		(*output)<<"[";

		for(int i=0;i<(int)m_arrayContent.size();i++){

			if(addIndentation)
				addSpaces(output,depth);

			int childType=m_arrayContent[i].getType();
			bool useIndentation=true;

			if(i==0 && (childType==JSONNode_TYPE_ARRAY || childType==JSONNode_TYPE_OBJECT))
				useIndentation=false;

			m_arrayContent[i].writeObject(output,depth+1,useIndentation);

			if(i!=(int)m_arrayContent.size()-1)
				(*output)<<","<<endl;
		}

		addIndentation=false;

		if(addIndentation)
			addSpaces(output,depth);
		else
			(*output)<<" ";

		(*output)<<"]";
	}else if(m_type==JSONNode_TYPE_NULL){

		if(addIndentation){
			(*output)<<endl;
			addSpaces(output,depth+1);
		}

		(*output)<<"null";
	}
}

void JSONNode::addArrayElement(JSONNode*value){
	m_arrayContent.push_back(*value);
}
