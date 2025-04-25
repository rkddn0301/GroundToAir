package groundToAir.airReservation.utils;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

// 메서드의 실행 시간을 측정하는 AOP
@Component
@Aspect
public class TimeTraceAop {
    // groundToAir 그룹의 airReservation 패키지 내 모든 메서드가 동작될 때마다 적용된다는 의미
    @Around("execution(* groundToAir.airReservation..*(..))")
    public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        System.out.println("START: " + joinPoint.toString());
        try {
            return joinPoint.proceed();
        } finally {
            long finish = System.currentTimeMillis();
            long timeMs = finish - start;
            System.out.println("END: " + joinPoint.toString() + " " + timeMs +
                    "ms");
        }
    }
}