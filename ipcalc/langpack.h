#ifndef langpack_h
#define langpack_h

#include <string.h>
#if defined(__DOS__)
#include <dos.h>
#endif

#define TAG_STR(v) (#v)

typedef enum {
    LANG_EN,
    LANG_ZH_GB2312,
    LANG_MAX
} lang_t;
typedef enum {
    TEXT_HELP,
    TEXT_IPV4_WILDCARD,
    TEXT_IPV4_NETMASK,
    TEXT_IPV4_AVAIL_HOSTS,
    TEXT_IPV4_NETWORK_ADDR,
    TEXT_IPV4_ADDR_RANGE,
    TEXT_IPV4_BROADCAST_ADDR,
    TEXT_IPV6_ADDR_COMP,
    TEXT_IPV6_ADDR_UNCOMP,
    TEXT_IPV6_ADDR_FULL,
    TEXT_IPV6_AVAIL_HOSTS,
    TEXT_IPV6_AVAIL_HOSTS2,
    TEXT_IPV6_ADDR_RANGE,
    TEXT_IPV6_ADDR_RANGE2,
    TEXT_INVALID_IPADDR,
    TEXT_INVALID_IPV6ADDR,
    TEXT_NETMASK_MISSING,
    TEXT_INVALID_NETMASK,
    TEXT_MAX
} lang_text_t;

static char* g_langData[LANG_MAX][TEXT_MAX] = {
    {
         "\
Usage: ipcalc ipaddr/netmask\n\
       ipcalc ipv6addr/netmask\n\
",
         "Wildcard:        %s = %u\n",
         "Netmask:         %s = %u\n",
         "Available hosts: %lu\n",
         "Network IP:      %s\n",
         "IP Range:        %s - ",
         "Broadcast IP:    %s\n",
         "IPv6 Address Compressed:   %s\n",
         "IPv6 Address Uncompressed: %s\n",
         "IPv6 Address Full:         %s\n",
         "Available hosts:           %lu\n",
         "Available hosts:           2^%u\n",
         "IP Range:                  %s -\n",
         "                           %s\n",
         "Malformed IP Address.\n",
         "Malformed IPv6 Address.\n",
         "Netmask Missing.\n",
         "Malformed Netmask.\n",
    },
    {
         "\
ʹ�÷�����ipcalc IPv4��ַ/��������\n\
          ipcalc IPv6��ַ/��������\n\
",
         "ͨ�����    %s = %u\n",
         "�������룺  %s = %u\n",
         "���õ�ַ����%lu\n",
         "�����ַ��  %s\n",
         "IP��ַ��Χ��%s - ",
         "�㲥��ַ��  %s\n",
         "IPv6��ַ��ѹ����ʽ����  %s\n",
         "IPv6��ַ��δѹ����ʽ����%s\n",
         "IPv6��ַ��������ʽ����  %s\n",
         "���õ�ַ����            %lu\n",
         "���õ�ַ����            2^%u\n",
         "IP��ַ��Χ��            %s -\n",
         "                        %s\n",
         "IP��ַ��ʽ����\n",
         "IPv6��ַ��ʽ����\n",
         "ȱ���������롣\n",
         "���������ʽ����\n",
    },
};

static lang_t g_lang = LANG_EN;
static inline void initlang()
{
#if defined(__DOS__)
    union REGPACK regs;
    regs.x.ax = 0xdb00;
    intr(0x2f,&regs);
    if (regs.x.bx == 0x5450) {
        g_lang = LANG_ZH_GB2312;
    }
#endif
}
static inline char* gettext(lang_text_t text)
{
    char *res = g_langData[g_lang][text];
    if (NULL == res) {
        res = g_langData[LANG_EN][text];
    }
    return NULL == res ? TAG_STR(text) : res;
}

#endif
