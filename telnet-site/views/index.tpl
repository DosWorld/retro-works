<!DOCTYPE html>
<html>
<%
import datetime
from langpack import lang;
%>
	<head>
		<meta charset='UTF-8'/>
		<title>{{lang('Index')}}</title>
	</head>
	<body>
		<table width='100%'>
			<tr>
% now = datetime.datetime.now();
				<td width='40%'>{{now.strftime(lang('_date_format'))}} {{lang('_week_format')[now.weekday()]}}</td>
				<td width='60%' align='right'>｜<a href='/dict'>{{lang('Dictionary')}}</a>｜<a href='/currency'>{{lang('Currency Exchange')}}</a>｜</td>
			</tr>
			<tr><td colspan='2'>
% if weather:
{{weather['basic']['city']}}
{{weather['now']['cond']['txt']}}
{{weather['daily_forecast'][0]['tmp']['min']}}{{lang('Centidegree')}}/{{weather['daily_forecast'][0]['tmp']['max']}}{{lang('Centidegree')}}
% try:
{{lang('AQI')}}{{weather['aqi']['city']['aqi']}} {{weather['aqi']['city']['qlty']}}
% except KeyError:
%	pass;
% end
<a href='/weather/detail.do'>[{{lang('Weather Detail')}}]</a>
% else:
{{lang('No Weather Information')}}
% end
				<a href='weather/setcity.do'>[{{lang('Change City')}}]</a>
			</td></tr>
			<tr><td colspan='2'>
				<hr/><div><b>{{lang('Up To Date')}}</b>&nbsp;<a href='/news'>{{lang('More')}}&gt;&gt;</a></div>
				
				<hr/><div><b>{{lang('Jokes Collection')}}</b>&nbsp;<a href='jokes.php'>{{lang('More')}}&gt;&gt;</a></div>
				<table width='100%'><tr>
					<td valign='top' width='50%'>
					</td>
				</tr></table>

				<hr/><div><b>{{lang('My Space')}}</b>&nbsp;<a href='/articles'>{{lang('More')}}&gt;&gt;</a></div>
				<ul>
				</ul>
				
				<hr/><div>{{!lang('About')}}</div>
			</td></tr>
		</table>
	</body>
</html>
