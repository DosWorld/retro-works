#include <stdio.h>
#include <string.h>
#include <dos.h>
#include <stdlib.h>
#include <jctype.h>
typedef unsigned char uint8_t;
typedef unsigned short uint16_t;

#define LINE_COUNT 33
static char *poem[]={
  "�J�j���}�P�Y",
  "�{�V����",
  "",
  "�J�j���}�P�Y",
  "���j���}�P�Y",
  "��j���ăm���T�j���}�P�k",
  "��v�i�J���_�����`",
  "�|�n�i�N",
  "���V�e�у��Y",
  "�C�c���V�d�J�j�����b�e����",
  "����j���Ďl���g",
  "���X�g���V�m��؃��^�x",
  "�A�������R�g��",
  "�W�u�����J���W���E�j�����Y�j",
  "���N�~�L�L�V���J��",
  "�\�V�e���X���Y",
  "�쌴�m���m�уm���m",
  "���T�i侃u�L�m�����j���e",
  "���j�a�C�m�R�h���A���o",
  "�s�b�e�ŕa�V�e����",
  "���j�c�J���^��A���o",
  "�s�b�e�\�m��m�R�����q",
  "��j���j�T�E�i�l�A���o",
  "�s�b�e�R�n�K���i�N�e���C�R�g�C�q",
  "�k�j�P���N�����\�V���E�K�A���o",
  "�c�}���i�C�J���������g�C�q",
  "�q�h���m�g�L�n�i�~�_���i�K�V",
  "�T���T�m�i�c�n�I���I���A���L",
  "�~���i�j�f�N�m�{�[�g���o��",
  "�z���������Z�Y",
  "�N�j���T���Y",
  "�T�E�C�t���m�j",
  "���^�V�n�i���^�C"
};
union REGS inregs, outregs;
static uint16_t far* vram = 0xA0000000;
static uint16_t far* vramattr = 0xA0002000;

void clrscr(){
	_fmemset((void far *)vram, 0, 4000);
	_fmemset((void far *)vramattr, 0, 4000);
}
void cputchar(uint16_t ch, uint16_t x, uint16_t y, uint16_t attr){
	uint16_t offset = (y<<6) + (y<<4) + x;
	uint16_t far *p_vram = (uint16_t far*)(vram + offset);
	uint16_t far *p_vramattr = (uint16_t far*)(vramattr + offset);
	
	if (ch > 0xFF){
		*p_vram = ch - 0x20;
		*(p_vram + 1) = ch + 0x60;
		*(p_vramattr) = attr;
		*(p_vramattr + 1) = attr;
	} else {
		*p_vram = ch;
		*p_vramattr = attr;
	}
}
#define MARGIN_TOP 1
void main(){
  unsigned int x=78-3*2-1,y=MARGIN_TOP,i,ch;
  unsigned char *p;

  /*Init screen*/
	putchar('\x1e');
	inregs.x.dx = 0;
	inregs.h.ah = 0x13;
	int86(0x18, &inregs, &outregs);
	outp(0x62, 0x4b);
	outp(0x60, 0x0f);
	inregs.h.ah=0x03;
	int86(0x18,&inregs,&outregs);
	clrscr();

  /*Display lines*/
  for(i=0;i<LINE_COUNT;i++){
    y=MARGIN_TOP;
    for(p=poem[i]; *p!='\0'; p+=2){
      ch=*p; ch<<=8; ch |= *(p+1);
      ch=jmstojis(ch);
      ch=(ch<<8)|(0xFF&(ch>>8));
      cputchar(ch,x,y,0xe1);
      y++;
    }
    x-=2;
  }

  /*Wait for keypress*/
	inregs.h.ah=0x05;
	int86(0x18,&inregs,&outregs);
  asm hlt;
	inregs.h.ah=0x05;
	int86(0x18,&inregs,&outregs);
	while(0==outregs.h.bh){
    asm hlt;
		inregs.h.ah=0x05;
		int86(0x18,&inregs,&outregs);
	}

  /*Recover screen*/
	inregs.h.ah=0x03;
	int86(0x18,&inregs,&outregs);
	outp(0x62, 0x4b);
	outp(0x60, 0x8f);
	putchar('\x1e');
	printf("\033[2J");
}

